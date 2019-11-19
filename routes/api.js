/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');

require('dotenv').config();

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const Schema = mongoose.Schema;

const issueSchema = new Schema({
  project: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: String,
  status_text: String,
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: Boolean
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = function(app) {
  mongoose.connect(CONNECTION_STRING, (err, db) => {
    if (err) {
      console.log('Database error: ' + err);
    } else {
      console.log('Successful database connection');
    }
  });

  app
    .route('/api/issues/:project')

    .get(async function(req, res, next) {
      var project = req.params.project;

      //set the default filter, and include the project
      const filters = {
        project: project
      };

      // loop over the req.query object
      for (const key in req.query) {
        // add each filter to the filters object
        filters[key] = req.query[key];
      }
      //find the issues for the given project
      const issues = await Issue.find({ ...filters }, (err, issues) => {});

      res.status(200).send(issues);
      return next();
    })

    .post(async function(req, res, next) {
      var project = req.params.project;
      // console.log('req.body :', req.body);

      // check if all required fields are present
      const { issue_title, issue_text, created_by } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res
          .status(400)
          .send('Title, Text and Created by fields must be filled in!');
        return next();
      }

      // create a new Issue for the passed in project with the req.body data
      const newIssue = new Issue({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        open: true
      });

      // save the Issue to the database
      await newIssue.save((err, doc) => {
        // return status and the new issue
        res.status(200).send(doc);
        return next();
      });
    })

    .put(async function(req, res, next) {
      var project = req.params.project;
      // get the issue id from the req.body object
      const id = req.body._id;

      // If more than 1 fields are sent and we have an id
      if (Object.keys(req.body).length > 1 && id) {
        try {
          // find the Issue for the passed in project and _id
          const issue = await Issue.findOne(
            { _id: id, project: project },
            (err, issue) => {
              if (err) {
                // if the issue could not be found, change the response message
                res.status(400).send('could not update ' + id);
                return next();
              }
            }
          );

          // loop over the req.body object and find values that need updating
          for (const key in req.body) {
            const element = req.body[key];
            // if the key is not the _id
            if (key !== '_id') {
              // if there is a value that has changed
              if (element) {
                // update the issue with the new value
                issue[key] = element;
              }
            }
          }

          // set the updated_on date to current date
          issue.updated_on = new Date();

          // save the updated issue to the db
          await issue.save().then(() => {
            // change the result to 'successfully updated'
            res.status(200).send('successfully updated');
            return next();
          });
        } catch (error) {
          console.log('error :', error);
          throw new Error('Error updating the Issue');
        }
      } else {
        res.status(400).send('no updated field sent');
        return next();
      }
    })

    .delete(async function(req, res, next) {
      var project = req.params.project;

      // check for an _id in the query object, if none check the body object
      const id = req.query._id || req.body._id;

      // if there is no id
      if (!id) {
        // respond with the message _id error
        res.status(400).send('_id error');
        return next();
      }
      // if there is an id
      if (id) {
        // check if the id is valid
        if (mongoose.Types.ObjectId.isValid(id)) {
          try {
            // get the corresponding issue
            const issue = await Issue.findOne(
              { _id: id, project: project },
              (err, issue) => {
                // console.log('deleted issue ->', issue);
              }
            );
            // if there is an issue
            if (issue) {
              // delete the issue
              await issue.deleteOne().then(() => {
                // send response message: 'deleted '+ _id
                res.status(200).send('deleted ' + id);
                return next();
              });
            }
          } catch (error) {
            console.log('error :', error);
            throw new Error('Error deleting the Issue');
          }
        }
      } else {
        res.status(400).send('could not delete ' + id);
        return next();
      }
    });
};
