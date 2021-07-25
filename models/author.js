'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Author.hasMany(models.Post);
      Author.hasMany(models.RestorePassword)
    }
  };
  Author.init({
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING , 
    email: {
      type: DataTypes.STRING , 
      unique:true , 
      allowNull: false  , 
      validate: {
        isEmail: true , 
      }
    }, 
    password: {
      type: DataTypes.STRING , 
      allowNull: false  ,
    },
    // createdAt : {
    //   type: DataTypes.DATE , 
    //   defaultValue: sequelize.literal("current_timestamp"), 
    //   allowNull:false , 
    // },
    // updatedAt : {
    //   type: DataTypes.DATA, 
    //   defaultValue: sequelize.literal("null on update current_timestamp"),
    //   allowNull: true, 
    // }
  }, {
    sequelize,
    modelName: 'Author',
    timestamps:false ,
  });
  return Author;
};