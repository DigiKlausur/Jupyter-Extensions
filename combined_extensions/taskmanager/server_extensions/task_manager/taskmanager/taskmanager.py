from notebook.utils import url_path_join as ujoin
from notebook.base.handlers import IPythonHandler
from . import handlers, api_handlers
from jinja2 import Environment, FileSystemLoader

def init_tornado_settings(webapp):
    jinja_env = Environment(loader=FileSystemLoader([handlers.template_path]))

    tornado_settings = dict(
        hbrs_jinja2_env = jinja_env
    )

    webapp.settings.update(tornado_settings)

def init_handlers(webapp):
    h = []
    h.extend(handlers.default_handlers)
    h.extend(api_handlers.default_handlers)

    def rewrite(x):
        pat = ujoin(webapp.settings['base_url'], x[0].lstrip('/'))
        return (pat,) + x[1:]

    webapp.add_handlers(".*$", [rewrite(x) for x in h])

def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app

    init_tornado_settings(web_app)
    init_handlers(web_app)
