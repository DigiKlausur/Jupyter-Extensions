#!/usr/bin/env python

from .base import BaseApiHandler, check_xsrf
from tornado import web
import sys
import json



class TaskHandler(BaseApiHandler):

    def initialize(self):
        self.path = '{}/share/jupyter/nbextensions/taskmanager/custom/'.format(sys.prefix)

    def load_tasks(self, filename):
        tasks = {
            'tasks': []
        }
        with open(self.path + filename, 'r') as f:
            tasks = json.loads(f.read())
        return tasks

    def save_task(self, filename, task):
        tasks = self.load_tasks(filename)
        tasks['tasks'].append(task)
        with open(self.path + filename, 'w') as f:
            f.write(json.dumps(tasks, indent=2, sort_keys=True))

class SaveTaskHandler(TaskHandler):

    @web.authenticated
    def post(self):
        self.save_task('custom_tasks.json', self.get_json_body())
        self.write(self.load_tasks('custom_tasks.json'))


class LoadTaskHandler(TaskHandler):

    @web.authenticated
    def get(self):
        tasks = self.load_tasks('tasks.json')
        custom_tasks = self.load_tasks('custom_tasks.json')
        tasks['tasks'].extend(custom_tasks['tasks'])
        self.write(tasks)


default_handlers = [
    (r'/tasks/api/save', SaveTaskHandler),
    (r'/tasks/api/load', LoadTaskHandler)
]