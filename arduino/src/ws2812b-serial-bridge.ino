#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif

Adafruit_NeoPixel strip_a = Adafruit_NeoPixel(32, 2, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip_b = Adafruit_NeoPixel(32, 3, NEO_GRB + NEO_KHZ800);

int inByte = 0;         // incoming serial byte
String buffer = "";

int animation = true;
uint16_t animationFrame = 0;

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  //init strips:
  strip_a.begin();
  strip_b.begin();
  
  int r = 10;
  int g = 5;
  int b = 2;

  uint16_t i;
  for(i=0; i<strip_a.numPixels(); i++) {
    strip_a.setPixelColor(i,  strip_a.Color(r,g,b));
    strip_b.setPixelColor(i,  strip_b.Color(r,g,b));
  }

  strip_a.show();
  strip_b.show();
}

void loop() {


  if (Serial.available() > 0) {
    // get incoming byte:
    inByte = Serial.read();

    if (inByte == 13) { //CR
      animation = false;
      
      int strip_id = getValue(buffer, 0).toInt();
      int r = getValue(buffer, 1).toInt();
      int g = getValue(buffer, 2).toInt();
      int b = getValue(buffer, 3).toInt();

      if (strip_id==10) {
        animation = true;
        Serial.println("ERROR");

      } else if (strip_id==99) {
        shutdownAnimation();
        Serial.println("SHUTDOWN");

      } else {
        Serial.println("LED");
        //DEBUG:
        
        uint16_t i;
        for(i=0; i<strip_a.numPixels(); i++) {
          strip_a.setPixelColor(i,  strip_a.Color(r,g,b));
          strip_b.setPixelColor(i,  strip_b.Color(r,g,b));
        }  
        strip_a.show();
        strip_b.show();
      }

      buffer = "";

    } else {
      buffer += (char)inByte;
    }
  }

  if (animation) {
    if (animationFrame>256*5) animationFrame=0;
    rainbowCycle(animationFrame++,4);
  }
}


// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if(WheelPos < 85) {
    return strip_a.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if(WheelPos < 170) {
    WheelPos -= 85;
    return strip_a.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return strip_a.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}



// Slightly different, this makes the rainbow equally distributed throughout
void rainbowCycle(int j, uint8_t wait) {
  uint16_t i;

  for(i=0; i< strip_a.numPixels(); i++) {
    strip_a.setPixelColor(i, Wheel(((i * 256 / strip_a.numPixels()) + j) & 255));
  }

  for(i=0; i< strip_b.numPixels(); i++) {
    strip_b.setPixelColor(i, Wheel(((i * 256 / strip_b.numPixels()) + j) & 255));
  }

  strip_a.show();
  strip_b.show();
  delay(wait);
}


void shutdownAnimation() {
  uint16_t i, j;

  for (j=0; j<strip_a.numPixels(); j++) {

    for(i=0; i< strip_a.numPixels(); i++) {
      if (j>i) {
        strip_a.setPixelColor(i, strip_a.Color(255, 255, 255));
        strip_b.setPixelColor(i, strip_b.Color(255, 255, 255));
      } else {
        strip_a.setPixelColor(i, strip_a.Color(0, 0, 0));
        strip_b.setPixelColor(i, strip_b.Color(0, 0, 0));
      }
    }

    strip_a.show();
    strip_b.show();
    delay(350);
  }
}




String getValue(String data, int index)
{
  char separator = ' ';
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length()-1;

  for(int i=0; i<=maxIndex && found<=index; i++){
    if(data.charAt(i)==separator || i==maxIndex){
        found++;
        strIndex[0] = strIndex[1]+1;
        strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }

  return found>index ? data.substring(strIndex[0], strIndex[1]) : "";
}
