## README

Please consider the fact that's  i'm a left-handed developer ^_^

#### Unfinished Task
* Able to publish the whole editor as an image to social network (e.g. Pinterest)

	Reason:    
    I was going to draw the html body as a svg image in to a canvas and then get convert it to convenient format(png/jpeg).Unfortunately the svg need strict xhtml to work properly ,which, in turn require a XMLSerializer object to parse DOM into valid XML format.Regetably the XMLSerializer object in WebKit family produce non-valid XML output (e.g selfcontained tag got tripped).
    	<br />  --> <br>
	On the otherhand i'm not allowed to use 3rd party Serializer libraries,which are not simple to write one in couple of days.The pin button are just simple part though.

#### Testing

* Memory usage tested (via chrome profiling tools)
* Bug tested (although i can't guarantee bug-free.There's no Quality Manager to work with.In fact, i never seen any dev claim their code are bug-free)
* Browser compatibility: IE10, FF(Gecko), WebKit (most recent).

#### Trivia
* The js files are scattered,because i got carried away by the modular structure of Node.js app, which i was developing lately.
* I got the impression that you consider memory leak pretty serious.As far as i know ,modern browser Garbage Collector(GC) working pretty well(which mean it's rare to have bug that cause unreachable memory not getting collected by GC).In case that dev unintetionally stacking up object reference,causing performance impact , it's can be easily detected with tool like Chrome Dev Tool.