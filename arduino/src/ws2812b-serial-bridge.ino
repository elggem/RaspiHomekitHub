#include <Adafruit_NeoPixel.h>
#include <RCSwitch.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif

Adafruit_NeoPixel strip = Adafruit_NeoPixel(56, 4, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip_a = Adafruit_NeoPixel(56, 2, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip_b = Adafruit_NeoPixel(56, 3, NEO_GRB + NEO_KHZ800);

RCSwitch mySwitch = RCSwitch();


int inByte = 0;         // incoming serial byte
String buffer = "";

void setup() {
  mySwitch.enableTransmit(10);  // Using Pin #10

  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  //init strips:
  strip.begin();
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
      
      int strip_id = getValue(buffer, 0).toInt();
      int r = getValue(buffer, 1).toInt();
      int g = getValue(buffer, 2).toInt();
      int b = getValue(buffer, 3).toInt();

      //control outlets (dirtiest of hacks)
      if (strip_id>10) {
        switch(strip_id) {
          case 11:
            if (r==0) { mySwitch.switchOff("11111", "10000"); } else { mySwitch.switchOn("11111", "10000"); }
            break;

          case 12:
            if (r==0) { mySwitch.switchOff("11111", "01000"); } else { mySwitch.switchOn("11111", "01000"); }
            break;

          case 13:
            if (r==0) { mySwitch.switchOff("11111", "00100"); } else { mySwitch.switchOn("11111", "00100"); }
            break;
        }

        Serial.println("SWITCH");
        buffer = "";

      } else {
        if (strip_id<1 || strip_id>4 || r<0 || r>255 || g<0 || g>255 || b<0 || b>255) {
          Serial.println("ERROR");
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
      }


    } else {
      buffer += (char)inByte;
    }
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

/*
void rainbow(uint8_t wait) {
  uint16_t i, j;

  for(j=0; j<256; j++) {
    for(i=0; i<strip.numPixels(); i++) {
      strip.setPixelColor(i, Wheel((i+j) & 255));
    }
    strip.show();
    delay(wait);
  }
}


// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if(WheelPos < 85) {
    return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if(WheelPos < 170) {
    WheelPos -= 85;
    return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}



// Slightly different, this makes the rainbow equally distributed throughout
void rainbowCycle(uint8_t wait) {
  uint16_t i, j;

  for(j=0; j<256*5; j++) { // 5 cycles of all colors on wheel
    for(i=0; i< strip.numPixels(); i++) {
      strip_a.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
      strip_b.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
    }
    strip_a.show();
    strip_b.show();
    delay(wait);
  }
}

//Theatre-style crawling lights.
void theaterChase(uint32_t c, uint8_t wait) {
  for (int j=0; j<10; j++) {  //do 10 cycles of chasing
    for (int q=0; q < 3; q++) {
      for (int i=0; i < strip.numPixels(); i=i+3) {
        strip.setPixelColor(i+q, c);    //turn every third pixel on
      }
      strip.show();

      delay(wait);

      for (int i=0; i < strip.numPixels(); i=i+3) {
        strip.setPixelColor(i+q, 0);        //turn every third pixel off
      }
    }
  }
}

//Theatre-style crawling lights with rainbow effect
void theaterChaseRainbow(uint8_t wait) {
  for (int j=0; j < 256; j++) {     // cycle all 256 colors in the wheel
    for (int q=0; q < 3; q++) {
      for (int i=0; i < strip.numPixels(); i=i+3) {
        strip.setPixelColor(i+q, Wheel( (i+j) % 255));    //turn every third pixel on
      }
      strip.show();

      delay(wait);

      for (int i=0; i < strip.numPixels(); i=i+3) {
        strip.setPixelColor(i+q, 0);        //turn every third pixel off
      }
    }
  }
}
*/

