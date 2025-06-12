// Export all models from a single file for easy importing
const User = require('./User');
const Education = require('./Education');
const Experience = require('./Experience');
const Skill = require('./Skill');
const Language = require('./Language');
const Publication = require('./Publication');
const Project = require('./Project');
const Award = require('./Award');
const Reference = require('./Reference');

module.exports = {
  User,
  Education,
  Experience,
  Skill,
  Language,
  Publication,
  Project,
  Award,
  Reference,
  // Additional models will be exported here as they are created
  // Example:
  // CV: require('./CV'),
  // Template: require('./Template'),
};
