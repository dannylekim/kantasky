'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const taskSchema = new Schema({
    name: {
        type: String,
        required: 'Please enter a task'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        default: undefined
    },
    status: {
        type: [{
            type: String,
            enum: ['pending', 'ongoing', 'completed']
        }],
        default: ['pending']
    },
    importance: {
        type: [{
            type: String,
            enum: ['normal', 'important', 'urgent']
        }],
        default: ['normal']
    }
})

module.exports = mongoose.model('Task', taskSchema)