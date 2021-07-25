// express
const express = require("express");
const app = express(); 
app.use(express.json());
app.use(express.urlencoded({extended:true})); 

// handlebars
const handlebars = require("express-handlebars");
app.engine("handlebars" , handlebars({
    defaultLayout: "main" , 
})) ; 
app.set("views" , "./handle_views") ; 
app.set("view engine" , "handlebars");

// express-session and session-file-store
const session = require("express-session");
const sessionFileStore = require("session-file-store")(session);
app.use(session({
    secret: "aD(!IXyE-s*r*RiZVIOE(J{DDs'*J+" , //Random key generator
    name: "Blog_App",
    resave: true, 
    saveUninitialized:true,
    store: new sessionFileStore({
        path: "/tmp/blogAppSession" , 
    }), 
}));

// express-flash
const flash = require("express-flash") ;
app.use(flash());

// bcrypt
const bcrypt = require('bcrypt');
// uuid
const uuid = require("uuid");

const {Op}= require("sequelize");

// our tables
var {Author , Post , RestorePassword } = require("./models") ;



// Middleware for safety of pages 

app.use( async(req,res,next) => {
    if(!req.path.endsWith("/login")&& !req.path.endsWith("/signup") && !req.path.endsWith("/restorepassword") && req.path.indexOf("reset-password")=== -1){
        if(!req.session.isAuthenticated){
            res.redirect("/login");
        }
    }

    next();
});


// *******************ROUTES********************
app.get("/reset-password" , async function(req,res){
    try{
        const {token , email} = req.query ; 
        var restPass = await RestorePassword.findOne({
            where: {
                token , 
                expires_at: {
                    [Op.gt]:Date.now() , 
                }
            }
        });

        if(!restPass){
            return res.redirect("/login");
        }

        res.render("reset-password" , {
            token ,
        });

    }catch(err){
        console.log(err) ; 
        res.redirect("/login")
    }
    
});

app.post("/reset-password" , async function(req,res){
    try{
        const {password , repassword , token} = req.body;
        if(!password !== repassword){
            flash("resetPasswordFailure" , "Your passwords did not match.");
            return res.redirect("reset-password?t=" + token);
        }
        var restPass = await RestorePassword.findOne({
            where: {
                token , 
                expires_at: {
                    [Op.gt]:Date.now() , 
                }
            }, 
            include : {
                all: true ,
                required: true , 
            }, 
            nested:true , 
        });
    
        if(!restPass){
            return res.redirect("/");
        }

       Author.update({
           password: bcrypt.hashSync(password , 10), 
       }, {
           where: {
               id: restPass.author.dataValues.id , 
           }
       }); 
       res.redirect("/"); 
    }catch(err){
        console.log(err) ; 
        res.redirect("/login");
    }
  
});

app.get("/restorepassword" ,  function(req , res){
    res.render("restorepassword"); 

}); 

app.post("/restorepassword" , async function(req , res){

    try{
        const {email} = req.body ; 
        var user = await Author.findOne({
            where:{
                email , 
            },  
        });

        if(!user) {
            flash("FailedRestore" , "Link was sent to your email!");
        }else {
            const resPass  = await RestorePassword.create({
                token: uuid.v4() , 
                expires_at: Date.now() + 300000  , 
                AuthorId: user.dataValues.id,
            }); 

            res.redirect("/reset-password"); 
            // email to user  resPass.token 
        }
    }catch(err){
        console.log(err);
        res.redirect("/restorepassword"); 
    }
}); 



app.get("/logout" , function(req , res){
    req.session.user = undefined ;
    req.session.isAuthenticated = false ;

    res.redirect("/login");

}) ; 

app.get("/login", function(req ,res){
    res.render("login");
});


app.post("/login", async  function(req ,res) {
    try{
        const {email , password} = req.body ; 

        const user = await Author.findOne({
            where : { 
                email,
            },
            raw: true , 
        });

        // checking password 
        if( !user  &&  !bcrypt.compareSync(password, user.password) ){
            req.flash("loginFailed" , "Something went wrong , please try again!");
            return res.redirect("/login");
        }
        console.log("user" , user) ; 
        console.log("session" , req.session); 

        req.session.user = {
            ...user , 
            password : undefined , 
        }; 
        console.log('req session user' , req.session.user);
        req.session.isAuthenticated =  true ;

        res.redirect("/");

    }
    catch(err){
        console.log(err);
        req.flash("loginFailed" , "Something went wrong , please try again!");
        res.redirect("/login");
    }
});

app.get("/signup" , async function(req, res){

    res.render("signup");

});

app.post("/signup" , async function(req, res){
    try{

        const {firstname , lastname ,email , password}=req.body; 
        // Password strength 

        var strength = 0 ;

        if(password.length >= 6 ){
            strength ++ ;
        }
        if( /[a-z]+/.test(password)){
            strength ++ ;
        }
        if( /[A-Z]+/.test(password)){
            strength ++ ;
        }
        if( /[0-9]+/.test(password)){
            strength ++ ;
        }

        if(strength < 4 ) {
            res.flash("passwordFailed", "Password is weak"); 
            return res.redirect("/signup"); 
        }

        const encryptedPassword = bcrypt.hashSync(password , 10);

        var result  = await Author.create({
            firstname , 
            lastname ,
            email , 
            password: encryptedPassword , 
        }) ; 

        res.redirect("/login");

    } catch(err){

        console.log(err);
        req.flash("signupFailed" , "Something went wrong. Try again."); 
        res.redirect("/signup") ; 

    }
});

app.get("/" , async function(req , res){
   try {

        // var result = await Author.findAll({
        //     attributes: ["id" , "firstname" , "lastname"] , 
        // });
        res.render("index");  

   } catch(err){

       if(err){console.log(err);}

   }    
});

app.post("/" , async function(req, res){
   
    try{
        const {title , article} = req.body ; 
        var result = await Post.create({
            title ,
            AuthorId: req.session.user.dataValues.id ,
            article
        });
        console.log(req.session.user.dataValues.id);
        req.flash( "succesMessage" ,"Post was created successfully"); 
        
    }catch(err){
        console.log(err);
        req.flash( "errorMessage", "Post could not be created");
        
    } finally {
        res.redirect("/");
    }
});

app.listen(process.env.PORT||3000 , function(err){
    if(err)throw err ; 
    console.log("connected"); 
});