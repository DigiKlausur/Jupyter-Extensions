## Taskmanager

This extension is based on the [snippets] nbextension.

It is supposed to work with nbgrader but also works without it and lets you save presets of tasks and add task presets.

Task presets are saved in the Jupyter Notebook nbextension folder:

```<sys-prefix>/share/jupyter/nbextensions/taskmanager/custom/```

in the file ```custom_tasks.json```.

### How does it work?

A tutorial can be found [here].



### Installation

Install via ```pip install .```.

Uninstall via ```pip uninstall taskmanager```.

### How to run it

The extension will be automatically loaded whenever you start a Jupyter Notebook.

[snippets]: https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tree/master/src/jupyter_contrib_nbextensions/nbextensions/snippets

[here]: Tutorial.md