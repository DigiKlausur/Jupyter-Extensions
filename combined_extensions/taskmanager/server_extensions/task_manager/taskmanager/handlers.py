from .base import BaseHandler
import os

class HbrsGraderBaseHandler(BaseHandler):

    def get(self):
        html = self.render('base.tpl', title='Wooohooo!')
        self.write(html)


root_path = os.path.dirname(__file__)
template_path = os.path.join(root_path, 'templates')

default_handlers = [
    (r"/hbrs_grader", HbrsGraderBaseHandler),
]