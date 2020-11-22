<h1 align="center">
    <img src="assets/images/logo/TolkProjectIcon.ai.svg" />
</h1>


<h1 align="center">
    A Beautiful Django, Vanilla JavaScript Chat Application
</h1>

<br/>
<br/>
<br/>

<p>Tolk is a single page chat web application developed using <a href="https://github.com/django/django">django web framework </a> and vannila javascript.<br/>
It's meant to used as a portofolio project to showcase my abilities in web development.<br/>
You can check it out in <a href="http://tolk-project.herokuapp.com/">demo</a>.
</p>
<br/>

## Running tolk locally
close the repo
```
git clone https://github.com/MuhammadSalahAli/TolkProject.git
```
checkout the development branch
```
git checkout devleopment
```
install dependencies
```
pip install -r requirements.txt
```
now run the development server
```
python manage.py runserver
```
visit <a href="http://127.0.0.1:8000/">http://127.0.0.1:8000/</a> and you will see the tolk preloader.


<br/>
<br/>

## How tolk works
for backend tolk uses <a href="https://github.com/django/channels">channels</a> an async django framework.
and for front-end tolk uses it's own custom built javascript framework called silly.js. silly provides tolk with the ability to write, render html elements, send ajax requests, and since it's a chat application silly provides simple websocket management. 

<br/>

<br/>

<img src="Documentation/JsAppClassdiagram.jpg"  width="800" height="700"/>

<p>
 A UML Class Diagram For Silly.
</p>
