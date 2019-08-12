## Task Button

This extension lets the student switch between different notebooks with a toolbar button.

Whenever the button is clicked the current notebook is saved.

For this to work the metadata of the notebook needs to contain the following field:

```
'taskbook' : {
  'next': <name of next notebook>,
  'prev': <name of previous notebook>
}
```

The name of the notebook does not contain the file extension ```*.ipynb```.

In the folder ```\Taskbook``` you'll find an example.