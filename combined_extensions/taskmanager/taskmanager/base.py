import json
import functools

from notebook.base.handlers import IPythonHandler


class BaseHandler(IPythonHandler):

    def render(self, name, **ns):
        template = self.settings['hbrs_jinja2_env'].get_template(name)
        return template.render(**ns)

class BaseApiHandler(BaseHandler):

    def get_json_body(self):
        """Return the body of the request as JSON data."""
        if not self.request.body:
            return None
        body = self.request.body.strip().decode('utf-8')
        try:
            model = json.loads(body)
        except Exception:
            self.log.debug("Bad JSON: %r", body)
            self.log.error("Couldn't parse JSON", exc_info=True)
            raise web.HTTPError(400, 'Invalid JSON in body of request')
        return model



def check_xsrf(f):
    @functools.wraps(f)
    def wrapper(self, *args, **kwargs):
        _ = self.xsrf_token
        return f(self, *args, **kwargs)
    return wrapper