# Exam toolbar

Adds a toolbar to each cell that is not marked as read-only

- Adds functionality to put tests into the metadata (see attached notebook for details)
- Add buttons to switch between edit and preview mode in markdown cells
- Add button to run a cell
- Add button to validate a cell by executing the cell alongside the test from the metadata

Structure of the metadata of a code cell with attached test:

```
   "metadata": {
    "hbrs_grader": {
     "test": [
      "assert square(9) == 81\n",
      "print('All tests successful')"
     ]
    }
```

The code in under "test" will be executed when the validate button is pressed.

To enable the toolbar when the notebook is loaded add 'Exam Toolbar' to the metadata of the notebook.

```
"metadata": {
  "celltoolbar": "Exam Toolbar",
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  }
  ```
