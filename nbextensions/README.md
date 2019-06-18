

## nbextensions

To install an nbextension navigate to the folder nbextensions of the repository in a terminal:
```
jupyter nbextension install name_of_extension --sys-prefix
```
Example for the restricted notebook extension:
```
jupyter nbextension install restricted_notebook --sys-prefix

```

To enable the extension for the notebook view:
```
jupyter nbextension enable name_of_extension/entry_point --sys-prefix
```
To enable for each page (e.g. also the file browser):
```
jupyter nbextension enable name_of_extension/entry_point --sys-prefix --section='common'
```

For the restricted notebook extension (entry point is main.js):
```
jupyter nbextension enable restricted_notebook/main --sys-prefix --section='common'
```

To disable just replace enable by disable.
