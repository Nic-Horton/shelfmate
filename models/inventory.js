'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Inventory extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Inventory.belongsTo(models.Users, {
				foreignKey: 'userId',
				onDelete: 'CASCADE',
			});
		}
	}
	Inventory.init(
		{
			userId: DataTypes.INTEGER,
			item: DataTypes.STRING,
			category: DataTypes.STRING,
			measurement: DataTypes.INTEGER,
			measurementType: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Inventory',
		}
	);
	return Inventory;
};
