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

const CONNECTION_STRING = process.env.MONGO; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const Schema = mongoose.Schema;

const issueSchema = new Schema({
  username: String,
  exercises: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Exercise'
    }
  ]
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

    .get(function(req, res) {
      var project = req.params.project;
    })

    .post(function(req, res) {
      var project = req.params.project;
      console.log('req.body :', req.body);
    })

    .put(function(req, res) {
      var project = req.params.project;
    })

    .delete(function(req, res) {
      var project = req.params.project;
    });
};
