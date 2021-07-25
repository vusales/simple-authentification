'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RestorePassword extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RestorePassword.belongsTo(models.Author);

    }
  };
  RestorePassword.init({
    token: DataTypes.STRING,
    expires_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'RestorePassword',
    timestamps:false , 
  });
  return RestorePassword;
};