**Version "0.2.4"**  
- 0: the project is not MVP yet  
- 2: two main working functionalities: toolbar, notes  
- 2: 
    - the site is set and stylised and implementing functionalities for listing links is next
    - working notes save - load
        - might save text box sizes too later
    - x on note iconizes and trash button deletes completely (removing text would be two cntrl+A backspace so why have two deletes)

## Tree
Can't be bothered to edit this properly for preview so just look at the edit version please  
I made this for myself to have a better look of our project  

sitenotes-extension (main folder)  
├── public
    ├── assets
    ├── icons
        ├── placeholder.png
    ├── note-icons
        ├── anchor.svg
        ├── download.svg
        ├── edit.svg
        ├── info.svg
        ├── palette.svg
        ├── trash.svg
        ├── upload.svg
        ├── X.svg
    ├── popup-icons
        ├── compress-solid.svg
        ├── line.svg
        ├── list-solid.svg
        ├── message-solid.svg
        ├── note-sticky-solid.svg
        ├── pen-solid.svg
    ├── toolbar-icons
        ├── circle.svg
        ├── color.svg
        ├── eraser.svg
        ├── highlighter.svg
        ├── move.svg
        ├── pen-solid.svg
        ├── pencil_with_line.svg
        ├── upload.svg
    ├── manage-notes.css
    ├── manage-notes.html
    ├── manifest.json
    ├── note.css
    ├── toolbar.css
    ├── vite.svg
├── src
    ├── assets
        ├── react.svg
    ├── App.css
    ├── App.tsx
    ├── background.ts
    ├── content-script-draw.ts
    ├── content-script-highlighter.ts
    ├── content-script-img.ts
    ├── content-script-note.ts
    ├── content-script-toolbar.ts
    ├── database.ts
    ├── index.css
    ├── main.tsx
    ├── manage-notes.ts
    ├── vite-env.d.ts
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.app.tsbuildinfo
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.node.tsbuildinfo
├── vite.config.ts

## TODO:  

- write links on page that can be visited and changes were made to (Summary)
- add the following buttons next to it: (if) changes, delete all, (possibly rename and download all)
- store everything's location ([see how everything is meant to be saved here](#how-things-are-meant-to-be-saved)) and content on the mentioned link so when visiting again, they all show up automatically
- and always save automatically after every change

Summary page:
- src/manage-notes.ts - only has some button press functionalities for now
- public/manage-notes.html and public/manage-notes.css - only has placeholder text for now

Using existing functionalities:
- src/content-script* ts files
- public/note.css
- public/toolbar.css
- icon folders inside public folders

## How things are meant to be saved

What we are trying to achieve is to even upon reload, every change stays where they were the last time.  
Every change is connected to a link - therefore if the link is not the same and/or doesn't exist in our list, there won't be changes that appear as there are non made on there.  
The links are supposed to be listed on manage-notes.html's Summary and be clickable.   
F.e. we edit on Wikipedia's page about Japan, where we leave notes and images to help our study. Upon reload, every change appears, but clicking on a different site doesn't show any of the changes that we might have made prior on other sites (except if we did make changes on that website too and is listed on Summary page).  

Toolbar:
    - if it stayed open or not
    - exact location on window

Drawings (and rubber):
    - exact location on window
    - exact size and color
    - can be cleared with a rubber

Image:
    - exact location on window
    - exact size and direction

Marker:
    - exact text that was marked (make sure they are applied on reload too)
        - do not mark every single instance of that text, just the text that was marked

Note:
    - exact location on window
    - exact color that was applied (RGB)
    - exact title and text inside note

OH! and creation and modification timestamps except toolbar (maybe? lol). Silly me.  

Contender technologies considered for saving:
    - IndexedDB (absolutely badass, saves anything up to 2 heebiejeebies, and yes, I ended up using this)
    - Chrome Storage API (meh)
    - localStorage (2-10MB limit, so not likely, only handles strings)

Achieved with the following PowerShell function (because "tree -I" didn't want to work for me no matter how many forums said it does"):  

```powershell
function Show-Tree ($path, $indent = 0) {
    Get-ChildItem -Path $path | ForEach-Object {
        # Skip directories named 'node_modules', 'dist', or 'helpers' for cleaner printing (remove if needed)
        if ($_.PSIsContainer -and $_.Name -match 'node_modules|dist|helpers') {
            return
        }

        # Print folder or file with tree structure indentation
        Write-Host (" " * $indent + "├── " + $_.Name)

        # If directory, increase indent
        if ($_.PSIsContainer) {
            Show-Tree -path $_.FullName -indent ($indent + 4)
        }
    }
}

# Prints out tree by calling the function (make sure you are inside sitenotes-extension already)
Show-Tree -path .
```
