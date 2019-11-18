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
  title: { type: String, required: true },
  text: { type: String, required: true },
  createdBy: { type: String, required: true },
  assignedTo: String,
  statusText: String
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

    .get(async function(req, res) {
      var project = req.params.project;
      // console.log('req.body :', req.body);
      const issues = await Issue.find({}, (err, issues) => {
        const result = [];
        issues.forEach(issue => {
          console.log('issue :', issue);
        });
        res.send(issues);
      });
    })

    .post(async function(req, res) {
      var project = req.params.project;
      // console.log('req.body :', req.body);

      // create a new Issue for the passed in project with the req.body data
      const newIssue = new Issue({
        project: project,
        title: req.body.issue_title,
        text: req.body.issue_text,
        createdBy: req.body.created_by,
        assignedTo: req.body.assigned_to,
        statusText: req.body.status_text
      });
      // console.log('newIssue :', newIssue);

      // save the Issue to the database
      newIssue.save((err, doc) => {});
    })

    .put(function(req, res) {
      var project = req.params.project;
    })

    .delete(function(req, res) {
      var project = req.params.project;
    });
};
