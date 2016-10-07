/**
 * Your task is to write a function that uses a deep learning
 * algorithm to determine the common set of tags between
 * multiple github profile pictures
 * 
 * Given an array of github handles, searchCommonTagsFromGitHubProfiles should:
 *   1) get the public profile associated with each handle
 *   2) extract the avatar_url of each profile
 *   4) get the set of tags for each avatar_url (requires authentication)
 *   5) find the intersection of the tags
 * 
 * Much of the heavy lifting has been done already in `lib/advancedChainingHelpers`,
 * you just have to wire everything up together! Once you pass this one, you'll
 * be a promise chaining master! Have fun!
 */

var Promise = require('bluebird');
var lib = require('../../lib/advancedChainingLib.js');
var keys = require('./apiKeys');

// We're using Clarifai's API to recognize different an image into a list of tags
// Visit the following url to sign up for a free account
//     https://developer.clarifai.com/accounts/login/?next=/applications/
// Then, create a new Application and pass your Client Id and Client Secret into the method below
lib.setImageTaggerCredentials(keys.CLARIFAI_CLIENT_ID,
  keys.CLARIFAI_CLIENT_SECRET);
lib.setGitHubCredentials(keys.GITHUB_CLIENT_ID, keys.GITHUB_CLIENT_SECRET);

var searchCommonTagsFromGitHubProfiles = function(githubHandles) {
  return Promise.all(
    githubHandles.map(user => lib.getGitHubProfile(user))
  )
  .then(profiles => profiles.map(profile => profile.avatarUrl))
  .then(function(avatarUrls) {
    var result = [];
    result[0] = avatarUrls;
    result[1] = lib.authenticateImageTagger();
    return Promise.all(result);
  })
  .then(result => {
    return Promise.all(
      result[0].map(url => lib.tagImage(url, result[1]))
    );
  })
  .then(tagsArray => {
    return lib.getIntersection(tagsArray);
  })
  .catch(e => {
    console.log('Error!!!!!!!!!!!!!!!!!');
    console.log(e);
  });
};

// Export these functions so we can unit test them
module.exports = {
  searchCommonTagsFromGitHubProfiles: searchCommonTagsFromGitHubProfiles
};
