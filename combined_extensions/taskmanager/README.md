## Taskmanager

This extension is based on the snippets nbextension [1].

It is supposed to work with nbgrader but also works without it and lets you save presets of tasks and add task presets.

Task presets are saved in the Jupyter Notebook nbextension folder:

```<sys-prefix>/share/jupyter/nbextensions/taskmanager/custom/```

in the file ```custom_tasks.json```.

### How does it work?

A tutorial can be found [here].



### Installation

#### Nbextension

Just follow the [instructions] for nbextensions.


#### Server Extension

Navigate to the ```server_extensions/taskmanager``` folder.

Install via ```pip install -e .```.

Uninstall via ```pip uninstall taskmanager```.

### How to run it

Either start your Jupyter Notebook with the command:

```jupyter notebook --NotebookApp.nbserver_extensions="{'taskmanager.taskmanager':True}"```

Or put the following in your ```jupyter_notebook_config.py``` (see where the files are [located]):

```
c = get_config()
c.NotebookApp.nbserver_extensions = {
    'taskmanager.taskmanager': True,
}
```

[1]: https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tree/master/src/jupyter_contrib_nbextensions/nbextensions/snippets

[here]: Tutorial.md

[instructions]: https://github.com/DigiKlausur/Jupyter-Extensions/blob/master/nbextensions/README.md

[located]: https://jupyter-notebook.readthedocs.io/en/stable/config_overview.html