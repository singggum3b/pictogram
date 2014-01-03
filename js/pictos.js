/**
 * Created by singgum3b on 12/27/13.
 */

function Pictos(element) {
	this.index = 0;
	this.color = Pictos.COLOR.DEFAULT;
	this.type = Pictos.ICON.DEFAULT;
	//Storing the reference to DOM element are more effective than store the ID.
	this.el = element;
}

Pictos.ICON = {
	KNIFE: 'icon-knife',
	FORK: 'icon-fork',
	DISH: 'icon-dish'
};

Pictos.COLOR = {
	RED: 'icon-red',
	BLUE: 'icon-blue',
	GREEN: 'icon-green'
};
