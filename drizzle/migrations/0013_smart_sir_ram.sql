ALTER TABLE `report` ADD `type` text;
UPDATE `report` SET `type` = 'hh' WHERE `hrs` > 0;