// Export all controllers from a single file for easy importing
const authController = require('./authController');
const profileController = require('./profileController');
const educationController = require('./educationController');
const experienceController = require('./experienceController');
const skillController = require('./skillController');
const languageController = require('./languageController');
const publicationController = require('./publicationController');
const projectController = require('./projectController');
const awardController = require('./awardController');
const referenceController = require('./referenceController');

module.exports = {
  authController,
  profileController,
  educationController,
  experienceController,
  skillController,
  languageController,
  publicationController,
  projectController,
  awardController,
  referenceController,
  // Additional controllers will be exported here as they are created
  // Example:
  // cvController: require('./cvController'),
};
