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
const slugify = require('slugify');

require('dotenv').config();

const CONNECTION_STRING = process.env.MONGO; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

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
    })

    .delete(async function(req, res, next) {
      var project = req.params.project;
    });
};
