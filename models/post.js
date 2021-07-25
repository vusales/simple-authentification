'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.belongsTo(models.Author);
    }
  };
  Post.init({
    title: {
      type:DataTypes.STRING, 
      allowNull: false , 
      validate: {
      is: /^.{1,160}$/i
      },
    },
    article: {
      type:DataTypes.STRING, 
      allowNull: false , 
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
    modelName: 'Post',
    timestamps:false ,
  });
  return Post;
};