# -*- coding: utf-8 -*-


from setuptools import setup, find_packages


with open('README.md') as f:
    readme = f.read()

with open('LICENSE') as f:
    license = f.read()

setup(
    name='taskmanager',
    version='0.2.0',
    description='Task Manager',
    long_description=readme,
    author='Tim Metzler',
    author_email='tim.metzler@h-brs.de',
    license=license,
    packages=find_packages(exclude=('tests', 'docs')),
    include_package_data = True,
    data_files = [
        ("share/jupyter/nbextensions/taskmanager", [
            "taskmanager/static/main.js",
            "taskmanager/static/main.css",
            "taskmanager/static/utils.js"
        ]),
        ("share/jupyter/nbextensions/taskmanager/taskbar", [
            "taskmanager/static/taskbar/taskbar.js",
            "taskmanager/static/taskbar/taskdecorator.js",
            "taskmanager/static/taskbar/taskeditor.js"
        ]),
        ("share/jupyter/nbextensions/taskmanager/models", [
            "taskmanager/static/models/nbgrader_model.js",
            "taskmanager/static/models/task_model.js"
        ]),
        ("share/jupyter/nbextensions/taskmanager/custom", [
            "taskmanager/static/custom/custom_tasks.json",
            "taskmanager/static/custom/tasks.json"
        ]),
        ("etc/jupyter/nbconfig/notebook.d", [
            "jupyter-config/nbconfig/notebook.d/taskmanager.json"
        ]),
        ("etc/jupyter/jupyter_notebook_config.d", [
            "jupyter-config/jupyter_notebook_config.d/taskmanager.json"
        ])
    ],
    zip_safe=False
)
