# Collection of extensions for exam mode

## Extra Cells

The extra cells extension enables support to display multiple choice and single choice cells. This is already included in [our nbgrader version](https://github.com/DigiKlausur/nbgrader). 

This only needs to be installed if nbgrader is not installed on the server the student works on.

To create a multiple choice or single choice cell, you can use out nbgrader version.

## Restricted Tree

The restricted tree extension removes the clusters tab, the shutdown widget and the ability to remove or create new notebooks.

This needs to be enabled with the keyword ```--section=tree```:

```jupyter nbextension install restricted_tree```

```jupyter nbextension enable restricted_tree/main --section=tree```

## Exam View

The exam view bundles the following three extensions:

- assignment_view
- restricted_notebook
- run_control

The assignment view is a toolbar that gives a visual indicator which cells are nbgrader solution cells and also displays the grade id alongside it.

The restricted notebook gets rid of most menus and buttons and makes sure students can not create new cells or delete old ones.

Run control combines several extensions from the [Jupyter contrib extensions](https://github.com/ipython-contrib/jupyter_contrib_nbextensions) to allow cells to be hidden, used as initialization cells or freeze them.