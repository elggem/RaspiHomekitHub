//all units in mm!!

//TODO:
// - refactor code to make more modular / configurable
// X implement rounded corners on endcaps.
// X measure all components to make sure they fit
// X redesign alignment tabs so that they dont look as stupid and immediately break off...
// X make cable channel for ws2812b cables (channel on bottom + besides PSU to middle chamber) make it symmetrical for antenna!
// X make the cutout on the bottom fit the kaltgeräte anschluss directly.
// X can we make the LED channels completely internal (making it a full case?)

module roundedRect(size, radius)
{
x = size[0];
y = size[1];
z = size[2];

linear_extrude(height=z)
hull()
{
    // place 4 circles in the corners, with the given radius
    translate([(-x/2)+(radius/2), (-y/2)+(radius/2), 0])
    circle(r=radius);

    translate([(x/2)-(radius/2), (-y/2)+(radius/2), 0])
    circle(r=radius);

    translate([(-x/2)+(radius/2), (y/2)-(radius/2), 0])
    circle(r=radius);

    translate([(x/2)-(radius/2), (y/2)-(radius/2), 0])
    circle(r=radius);
}
}

// Rounded primitives for openscad
// (c) 2013 Wouter Robers 
module rcylinder(r1=10,r2=10,h=10,b=2)
{translate([0,0,-h/2]) hull(){rotate_extrude() translate([r1-b,b,0]) circle(r = b); rotate_extrude() translate([r2-b, h-b, 0]) circle(r = b);}}

module rcylinder_bottom(r=65/2,h=10,b=2) {
    translate([0,0,h])
    difference() {
        rcylinder(r1=r, r2=r, h=h*2, b=b);
        linear_extrude(height=h) circle(r+0.1);
    }
}

diameter = 75;

module psu_holder()
{
// tube is 650mm in diameter ??? MEASURE THIS!
// PSU: 110x50x32 mm

    difference()
    {
        circle(diameter/2);
        translate([-25,-16,0]) square([50,32]);
    }
}


module logic_holder()
{
// PI is 85.60mm x 56mm x 21mm (with 2mm spacing
    //actually 60mm width becuase of audio plug
    difference()
    {
        circle(diameter/2);
        {
            translate([-25,-16,0]) square([50,32]);
            translate([-60/2,-27/2,0]) square([60,27]);
        }
    }
}

module composite_holder() 
{
    //cable channel at the bottomn
    linear_extrude(height = 5) 
    difference() 
    {
        circle ((diameter-5)/2);
        translate([-25,-16,0]) square([50,32]);
    }
    
   translate([0,0,5])linear_extrude(height = 115) psu_holder();
   translate([0,0,120]) linear_extrude(height = 80) logic_holder(); 
}

module end_cap(cap_height) {
        rcylinder_bottom(r=diameter/2, h=cap_height, b=2);

}

module cap_hole() {
    translate([0,0,-2.5])
    roundedRect([27,21,5], 3);
   //translate([-31/2,-23/2]) linear_extrude(height=cap_height) square([31,23]);
}

module composite_cap()
{
    end_cap(2.5);
    translate([0,0,2.5]) linear_extrude(height = 50)     
    difference()
    {   
        circle(diameter/2);
        {
            
            translate([-60/2,-27/2,0]) square([60,27]);
        }
    }
    
    translate([0,0,2.5]) linear_extrude(height = 65)     
    difference()
    { 
        translate([-25,-15,0]) square([50,30]);
        translate([-60/2,-27/2,0]) square([60,27]); 
    }
}

module composite_bottom_cap()
{
    difference() {
        end_cap(2.5);
        cap_hole();
    }

    translate([0,0,2.5]) linear_extrude(height = 6)     
    difference()
    {   
        circle(diameter/2);
        circle((diameter-5)/2);
    }
    
}


module led_strip() {
    //12.5mm wide, 4mm thick with casing on, 1.85mm thick without casing
    translate([-2,-13/2,0]) cube([2,13,200]);
}

module led_strips(number) {
            for (a = [1:1:number] )
               rotate([0,0,a*(360/number)]) translate([(diameter/2)-1.5,0,0]) led_strip(); 
}

module cable_channel_x() {
    translate([-13/2,-2/2,0]) cube([13,2,200]);
}

module cable_channel_y() {
    translate([-2/2,-13/2,0]) cube([2,13,200]);
}


module cable_tunnel() {
    translate([-13/2,-diameter/2,0]) cube([13,diameter,2]);
    translate([-diameter/2,-13/2,0]) cube([diameter,13,2]);
}

$fn=100;

//Main Holder:
rotate([0,180,0])
translate([0,0,-200])
difference()
{
    composite_holder();
    led_strips(4);
    translate([0,-17,0]) cable_channel_x();
    translate([0,17,0]) cable_channel_x();
    translate([-26,0,0]) cable_channel_y();
    translate([26,0,0]) cable_channel_y();
    cable_tunnel();

}


     

//Cap:
translate([80,0,0]) 
{
difference()
{
    composite_cap();
     translate([0,0,2.5]) led_strips(4);
}

}


//bottom cap
translate([-80,0,0]) 
{
difference()
{
    composite_bottom_cap();
    translate([0,0,2.5]) led_strips(4);
}

}