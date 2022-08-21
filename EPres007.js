/////////////////////////////////// c_imageStore
function cbImageStoreLoadFail() { alert("Image loading is failed"); }

class c_imageStore
{ constructor(path)
  { this.image = loadImage(path, null, cbImageStoreLoadFail);
    this.path = path;
    this.loaded = false;
  }
}

let imageStore = [], imageStoreCount = 0, imageStoreLoadedCount = 0;

function imageStoreAdd(path) { imageStoreCount++; imageStore[imageStoreCount - 1] = new c_imageStore(path); }

function imageStoreProgress()
{ for (let i = 0; i < imageStoreCount; i++) { if (!imageStore[i].loaded && (imageStore[i].image.width > 1)) { imageStore[i].loaded = true; imageStoreLoadedCount++; } }
  return imageStoreLoadedCount;
}

function imageStoreProgressDraw()
{ if (imageStoreCount == 0) { return alert("No images store"); }
  if (imageStoreLoadedCount == imageStoreCount) { return false; }
  imageStoreProgress();
  let w = round(width / 6) * 2, h = round(width / 160) * 2, x = w, y = height / 2 - h / 2;
  background(255);
  noStroke(); fill(180); rect(x - 4, y - 4, w + 8, h + 8); fill(160); rect(x, y, w, h);
  fill(220); rect(x, y, w * imageStoreLoadedCount / imageStoreCount, h);
  return true;                               
}

function imageStoreGet(path)
{ for (let i = 0; i < imageStoreCount; i++) { if (imageStore[i].path.includes(path)) { if (imageStore[i].loaded) { return imageStore[i].image; } else { return null; } } }
  return null;
}
function ISG(path) { return imageStoreGet(path); }

/////////////////////////////////// BASE
let cBack;

/////////////////////////////////// special
function ptx(x) { return x * width; }
function pty(y) { return y * height; }
function prx(x) { return round(x * width); }
function pry(y) { return round(y * height); }

function spf(v, e)
{ v = 0.5 + (e - 0.5) * v;
  let vv = v * v, ee = e * e;
  return (3 * vv - 2 * v * vv - 0.5) / (3 * ee - 2 * e * ee - 0.5);
}

function mouseIn (x1, y1, x2, y2) { return ((mouseX > x1) && (mouseX < x2) && (mouseY > y1) && (mouseY < y2)); }

/////////////////////////////////// c_desk

const drawAsBlind = 1,
      drawAsWindow = 2;
let dskDrawAsDefault = drawAsWindow;

class c_desk
{ constructor()
  { this.drawAs = dskDrawAsDefault; this.cCollapse = cBack; this.cExpand = color(0);
    this.labelImage = null; this.label = false; this.labelWidth = this.labelHeight = this.labelSizeX = this.labelSizeY = this.labelPlaceX = this.labelPlaceY = 0.0;
    this.labelShow = true;
    this.x1 = this.y1 = this.x2 = this.y2 = this.vx = this.vy = this.ln = 0.0; this.loan = 0.2;
    this.mx1 = this.my1 = this.mx2 = this.my2 = this.mvx = this.mvy = 0.0;
    this.blinkPhase = 0; this.blinkRange = 10; this.blinkLevel = 0.2; this.mouseIn = false;
    this.softness = 0.95; this.dissolveLevel = 0.8; this.active = true; this.dissolve = true; this.expanded = false; this.fvx = false;
    this.link = -1; this.phase = 0; this.range = 15; this.delta = 0; this.delay = 0;
  }

  place(xx1, yy1, xx2, yy2, lln, ce)
  { this.x1 = prx(xx1); this.y1 = pry(yy1); this.x2 = prx(xx2); this.y2 = pry(yy2); this.vx = this.x2 - this.x1; this.vy = this.y2 - this.y1;
    this.cExpand = ce;
    if ((this.vx < 0) || (this.vy < 0)) { xx1 = this.x1; this.x1 = this.x2; this.x2 = xx1; this.vx = -this.vx; yy1 = this.y1; this.y1 = this.y2; this.y2 = yy1; this.vy = -this.vy; }
    if (this.vx > this.vy) { this.ln = pry(lln); } else { this.ln = prx(lln); }
    this.fvx = (this.vx > 0.001); 
    if (this.fvx) { if (this.ln > 0) { this.mx1 = this.x1; this.my1 = this.y1; this.mx2 = this.x2; this.my2 = this.y1 + this.ln;
                                     } else { this.mx1 = this.x1; this.my1 = this.y1 + this.ln; this.mx2 = this.x2; this.my2 = this.y2; }
                  } else if (this.ln > 0) { this.mx1 = this.x1; this.my1 = this.y1; this.mx2 = this.x1 + this.ln; this.my2 = this.y2;
                                          } else { this.mx1 = this.x1 + this.ln; this.my1 = this.y1; this.mx2 = this.x2; this.my2 = this.y2; }
    this.mvx = this.mx2 - this.mx1; this.mvy = this.my2 - this.my1;
  }
  
  calcLabel()
  { if (!this.label) { return; }
    let w = this.mvx - abs(this.labelPlaceX) * 2 * width, h = this.mvy - abs(this.labelPlaceY) * 2 * width, px = abs(this.labelPlaceX) * width, py = abs(this.labelPlaceY) * width;  
    if (this.labelSizeX > 0) { w  = this.mvx * this.labelSizeX; this.labelHeight = w * this.labelHeight / this.labelWidth; this.labelWidth = w; 
                             } else if (this.labelSizeY > 0) { h  = this.mvy * this.labelSizeY; this.labelWidth = h * this.labelWidth / this.labelHeight; this.labelHeight = h;
                                                             } else if (this.labelWidth / this.labelHeight > w / h)
                                                                    { this.labelWidth = w; this.labelHeight = this.labelWidth * h / w;
                                                                    } else { this.labelHeight = h; this.labelWidth = this.labelHeight * w / h; }
    w = (this.mvx - this.labelWidth) / 2; h = (this.mvy - this.labelHeight) / 2;
    if (this.labelPlaceX > 0) { if (px < w) { this.labelPosX = this.mx1 + px; } else { this.labelPosX = this.mx1 + w; }
                              } else if (this.labelPlaceX < 0) { if (px < w) { this.labelPosX = this.mx2 - px - this.labelWidth; } else { this.labelPosX = this.x1 + w; }
                                                               } else { this.labelPosX = this.mx1 + w; }
    if (this.labelPlaceY > 0) { if (py < h) { this.labelPosY = this.my1 + py; } else { this.labelPosY = this.my1 + h; }
                              } else if (this.labelPlaceY < 0) { if (py < h) { this.labelPosY = this.my2 - py - this.labelHeight; } else { this.labelPosY = this.my1 + h; }
                                                               } else { this.labelPosY = this.my1 + h; }
    if (this.labelImage != null) { this.labelPosX = round(this.labelPosX); this.labelPosY = round(this.labelPosY);
                                   this.labelWidth = round(this.labelWidth); this.labelHeight = round(this.labelHeight);
                                   this.labelImage.resize(round(this.labelWidth * 2), round(this.labelHeight * 2));
                                   this.labelImage.resize(round(this.labelWidth), round(this.labelHeight));
                                 }
  }  
  
  setLabelWithMask(lImage, lMask, szx, szy, px, py)
  { this.labelImage = lImage;
    this.label = this.labelImage != null;
    if (this.label) { this.labelWidth = this.labelImage.width; this.labelHeight = this.labelImage.height;
                      if (lMask != null) { this.labelImage.mask(lMask); }
                      this.labelSizeX = szx; this.labelSizeY = szy; this.labelPlaceX = px; this.labelPlaceY = py; 
                      this.calcLabel();
                      
                    }
  }
  setLabel(lImage, szx, szy, px, py) { this.setLabelWithMask(lImage, null, szx, szy, px, py); }
  
  drawLabel(x, y, w, h, opacity)
  { if (this.label) { tint(255, round(opacity * 255)); if (this.expanded) { image(this.labelImage, round(x), round(y), round(w), round(h)); } else { image(this.labelImage, x, y, w, h); } } 
  }
 
  expand(d) { this.phase = 0; this.delta = 1; this.delay = d; }
  collapse(d) { this.phase = this.range; this.delta = -1; this.delay = d; } 

  getLabelWidth() { if (this.label) { return this.labelWidth / this.mvx; } else { return 0.0; } }  
  getLabelHeight() { if (this.label) { return this.labelHeight / this.mvy; } else { return 0.0; } }   
  
  getLabelPlaceX (p)
  { if (!this.label) { return 0.0; }
    if (p > 0) { return (this.labelPosX - this.mx1) / width; } else { if (p < 0) { return -(this.mx2 - this.labelPosX - this.labelWidth) / width; } else { return 0.0; } }
  }
  getLabelPlaceY (p)
  { if (!this.label) { return 0.0; }
    if (p > 0) { return (this.labelPosY - this.my1) / width; } else { if (p < 0) { return -(this.my2 - this.labelPosY - this.labelHeight) / width; } else { return 0.0; } }
  }

  drawAsWindow()
  { if (this.delay > 0) { this.delay--; if (!this.expanded) { return; } } 
    else { this.phase += this.delta; if (this.phase == 0) { this.delta = 0; this.mouseIn = false; this.expanded = false; return; }
           if (this.phase == this.range) { this.delta = 0; this.expanded = true; }
         }  
    if ((dskWait == -1) && this.active && mouseIn(this.mx1, this.my1, this.mx2, this.my2))
    { if ((this.expanded) && (this.mouseIn == false) && (this.phase == this.range)) { this.blinkPhase = this.blinkRange; this.mouseIn = true; }
    } else { this.mouseIn = false; }
    let lo = this.loan, ph = spf(1.0 * this.phase / this.range, this.softness);
    let c, ce = lerpColor(this.cExpand, color(255), this.blinkLevel * (1.0 * this.blinkPhase / this.blinkRange));
    this.blinkPhase--; if (this.blinkPhase < 0) { this.blinkPhase = 0; }
    noStroke(); 
    if (this.dissolve) { c = lerpColor(ce, this.cCollapse, (1 - ph) * this.dissolveLevel); } else { c = this.cExpand; }
    fill(c);
    if (this.fvx) { quad(this.x1, this.y1, this.x2, this.y2, this.x2 - this.vx * lo * (1 - ph), this.y2 + this.ln * ph, this.x1 + this.vx * lo * (1 - ph), this.y2 + this.ln * ph);
                  } else { quad(this.x1, this.y1, this.x2, this.y2, this.x2 + this.ln * ph, this.y2 - this.vy * lo * (1 - ph), this.x2 + this.ln * ph, this.y1 + this.vy * lo * (1 - ph)); }
    if (this.labelShow && this.label && (ph > 0.7))
    { let l = 1 - (1 - ph) * 2 * lo, ww = this.labelWidth, hh = this.labelHeight,
          ox = this.labelPosX + this.labelWidth / 2 - this.x1, oy = this.labelPosY + this.labelHeight / 2 - this.y1, xx, yy;
      if (this.fvx) { ww *= 1 + (l - 1) * abs(oy / this.ln); hh *= ph;
                      xx = this.x1 + ox - ww / 2; yy = this.y1 + oy * ph - hh / 2;
                    } else { ww *= ph; hh *= 1 + (l - 1) * abs(ox / this.ln);
                             xx = this.x1 + ox * ph - ww / 2; yy = this.y1 + oy - hh / 2;
                           }
      this.drawLabel(xx, yy, ww, hh, (ph - 0.7) / 0.3 + 0.001);                
    }
  }
  draw()
  { switch (this.drawAs)
    { case drawAsWindow: this.drawAsWindow(); break;
    }
  }
}

/////////////////////////////////// dsk[]
let dskCount = 30; 
let dskWait = -1, dskCurrent= -1;
let dsk = [];
let D;
function initDesks() { for (let i = 0; i < dskCount; i++) { dsk[i] = new c_desk(); } }
function setD(i) { D = dsk[dskCurrent = i]; }

function dskMouseIn()
{ for (let i = 0; i < dskCount; i++) { if (dsk[i].mouseIn) { dsk[i].mouseIn = false; return i; } }
  return -1;
}

/////////////////////////////////// c_element
class c_element
{ constructor()
  { this.image = null;
    this.x1 = this.y1 = this.x2 = this.y2 = this.vx = this.vy = 0.0;
    this.posX = this.posY = this.eWidth = this.eHeight = this.sizeX = this.sizeY = this.placeX = this.placeY = 0.0;
    this.blinkPhase = 0; this.blinkRange = 10; this.blinkLevel = 0.2; this.softness = 0.95; this.zoom = 0.1;
    this.active = this.expanded = this.mouseIn = false; this.link = -1; this.phase = 0; this.range = 5; this.delta = 0; this.delay = 0;
    this.selector = [];
  }

  //setSelector(int ... sw) { if (sw.length > 1) { this.selector = sw; } }
  
  calc()
  { if (this.image == null) { return; }
    let w = this.vx - abs(this.placeX) * 2 * width, h = this.vy - abs(this.placeY) * 2 * width, px = abs(this.placeX) * width, py = abs(this.placeY) * width;  
    if (this.sizeX > 0) { w  = this.vx * this.sizeX; this.eHeight = w * this.eHeight / this.eWidth; this.eWidth = w; 
                        } else if (this.sizeY > 0.00001) { h  = this.vy * this.sizeY; this.eWidth = h * this.eWidth / this.eHeight; this.eHeight = h;
                                                         } else if ( this.eWidth / this.eHeight > w / h) { this.eWidth = w; this.eHeight = this.eWidth * h / w;
                                                                                                    } else { this.eHeight = h; this.eWidth = this.eHeight * w / h; }
    w = (this.vx - this.eWidth) / 2; h = (this.vy - this.eHeight) / 2;
    if (this.placeX > 0) { if (px < w) { this.posX = this.x1 + px; } else { this.posX = this.x1 + w; }
                         } else if (this.placeX < 0) { if (px < w) { this.posX = this.x2 - px -this.eWidth; } else { this.posX = this.x1 + w; }
                                                     } else { this.posX = this.x1 + w; }
    if (this.placeY > 0) { if (py < h) { this.posY = this.y1 + py; } else { this.posY = this.y1 + h; }
                         } else if (this.placeY < 0) { if (py < h) { this.posY = this.y2 - py - this.eHeight; } else { this.posY = this.y1 + h; }
                                                     } else { this.posY = this.y1 + h; }
    this.posX = round(this.posX); this.posY = round(this.posY); this.eWidth = round(this.eWidth); this.eHeight = round(this.eHeight);
    this.image.resize(round(this.eWidth * 2), round(this.eHeight * 2)); this.image.resize(round(this.eWidth), round(this.eHeight));
  }
  placeWithMask(d, szx, szy, px, py, eImage, eMask)
  { if (d < 0) { return; }
    setD(d); this.x1 = D.mx1; this.y1 = D.my1; this.x2 = D.mx2; this.y2 = D.my2; this.vx = D.mvx; this.vy = D.mvy;
    this.sizeX = szx; this.sizeY = szy; this.placeX = px; this.placeY = py;
    this.image = eImage;
    if (this.image != null) { this.eWidth = this.image.width; this.eHeight = this.image.height;
                              if (eMask != null) { this.image.mask(eMask); }
                            }
    this.calc();
  }
  place(d, szx, szy, px, py, eImage) { this.placeWithMask(d, szx, szy, px, py, eImage, null); }
  
  drawElement(x, y, w, h, opacity)
  { if (this.image != null) { tint(255, round(opacity * 255 + 0.001)); if (this.expanded) { image(this.image, round(x), round(y), round(w), round(h)); } else { image(this.image, x, y, w, h); } } 
  }
  
  expand(d) { this.phase = 0; this.delta = 1; this.delay = d; }
  collapse(d) { this.phase = this.range; this.delta = -1; this.delay = d; }   
  
  draw()
  { if (this.image == null) { return; }
    if (this.delay > 0) { this.delay--; if (!this.expanded) { return; } } 
     else { this.phase += this.delta; if (this.phase == 0) { this.delta = 0; this.mouseIn = false; this.expanded = false; return; }
            if (this.phase == this.range) { this.delta = 0; this.expanded = true; }
          }  
    if (this.active && mouseIn(this.x1, this.y1, this.x2, this.y2))
    { if (this.expanded) { if (this.mouseIn == false) { if (this.phase == this.range) { this.blinkPhase = this.blinkRange; this.mouseIn = true; } } }
    } else { this.mouseIn = false; }
    let ph = spf(1.0 * this.phase / this.range, this.softness), z = (1 - ph) * this.zoom, w = z * this.eWidth, h = z * this.eHeight;
    this.drawElement(this.posX + w , this.posY + h, this.eWidth - 2 * w, this.eHeight - 2 * h, ph);
  }
}

/////////////////////////////////// elm[]
let elmCount = 50;
let elmCurrent;
let elm = [];
let E;
function initElements() { for (let i = 0; i < elmCount; i++) { elm[i] = new c_element(); } }
function setE(i) { E = elm[elmCurrent = i]; }

/////////////////////////////////// c_slide
class c_slide
{ constructor()
  { this.active = false;
    this.dStart = this.eStart = -1; this.dEnd = this.eEnd = -2; this.dCount = this.eCount = 0; this.dDelta = 5; this.eDelta = 2;
    
  }
  
  setDsk(s, e) { this.dStart = s; this.dEnd = e; this.dCount = e - s + 1; }
  setElm(s, e) { this.eStart = s; this.eEnd = e; this.eCount = e - s + 1; }

  startFrom(from)
  { let ds = 0, d; 
    if (this.dStart >= 0)
    { for (let i = from; i <= this.dEnd; i++) { dsk[i].expand(ds); ds += this.dDelta; }
      for (let i = this.dStart; i < from; i++) { dsk[i].expand(ds); ds += this.dDelta; }
      d = from - 1; if (d < this.dStart) { d = this.dEnd; }
      ds += -this.dDelta * 2 + dsk[d].range;
    }  
    if (this.eStart >= 0) { for (let i = this.eStart; i <= this.eEnd; i++) { elm[i].expand(ds); ds += this.eDelta; } }
  }
  start() { this.startFrom(this.dStart); }
  stopFrom(from)
  { if (dsk[from].link < 0) { return; } else { sldNext = dsk[from].link; }
    let ds = 0;
    if (this.eStart >= 0) 
    { for (let i = this.eEnd; i >= this.eStart; i--) { elm[i].collapse(ds); ds += this.eDelta; }
      ds += -this.eDelta * 2 + elm[this.eStart].range / 2;       
    }
    if (this.dStart >= 0)
    { for (let i = from; i <= this.dEnd; i++) { dsk[i].collapse(ds); ds += this.dDelta; }
      for (let i = this.dStart; i < from; i++) { dsk[i].collapse(ds); ds += this.dDelta; }
    }  
    dskWait = from - 1; if (dskWait < this.dStart) { dskWait = this.dEnd; }
  }
  draw()
  { if (this.dStart >= 0) { for (let i = this.dStart; i <= this.dEnd; i++) { dsk[i].draw(); } }
    if (this.eStart >= 0) { for (let i = this.eStart; i <= this.eEnd; i++) { elm[i].draw(); } }
  }
}

/////////////////////////////////// sld[]
let slideCount = 20;
let sldCurrent = 1, sldNext = -1;
let sld = [];
function initSlides() { for (let i = 0; i < slideCount; i++) { sld[i] = new c_slide(); } }

/////////////////////////////////// Load all images
function images_init()
{ imageStoreAdd("logo.png");
  imageStoreAdd("s01_d01_seriya_STANDART.png");
  imageStoreAdd("s01_d02_seriya_COMFORT.png");
  imageStoreAdd("s01_d03_seriya_PREMIUM.png");
  imageStoreAdd("icon_return.png");
  imageStoreAdd("s02_d01_systema_Econo.png");
  imageStoreAdd("s02_d02_systema_Largo.png");
  imageStoreAdd("s02_d04_osobennosti_serii_STANDART.png");
  imageStoreAdd("s03_d01_systema_Euro.png");
  imageStoreAdd("s03_d02_systema_Lumo.png");
  imageStoreAdd("s03_d03_systema_Bravo.png");
  imageStoreAdd("s03_d04_preimushestva_serii_COMFORT.png");
  imageStoreAdd("s04_d01_systema_Primo.png");
  imageStoreAdd("s04_d02_preimushestva_serii_PREMIUM.png");
  imageStoreAdd("s05_e01_Lumo.jpg");
  imageStoreAdd("s05_e01_Lumo_mask.png");
  imageStoreAdd("s05_e03_Lumo_description_02.png");
  imageStoreAdd("s05_e02_Lumo_description.png");/**/
}

/////////////////////////////////// LOGO
function logo_init() { setD(0); D.place(0.08, 1, 1, 1, -0.06, color(32, 66, 148)); D.setLabel(ISG("logo.png"), 0, 0.75, 0.01, 0); D.loan = 0.015; D.active = false; }
function logo_start() { dsk[0].expand(); }
function logo_draw() { background(cBack); dsk[0].draw(); }

/////////////////////////////////// SLIDE 01 / серии: СТАНДАРТ - КОМФОРТ - ПРЕМИУМ
function slide01_init()
{ setD(1); D.place(0, 1, 0.08, 1, -0.06, color(38, 84, 165)); D.active = false;
  setD(2); D.place(0, 0, 1.0/3, 0, 0.94, color(0, 110, 185)); D.setLabel(ISG("s01_d01_seriya_STANDART.png"), 0.8, 0, 0.05, 0.1); D.link = 2;
  setD(3); D.place(1.0/3, 0.94, 2.0/3, 0.94, -0.94, color(195, 50, 115)); D.setLabel(ISG("s01_d02_seriya_COMFORT.png"), 0.8, 0, 0.05, 0.1); D.link = 3;
  setD(4); D.place(1, 0, 1, 0.94, -1.0/3, color(101, 82, 153)); D.setLabel(ISG("s01_d03_seriya_PREMIUM.png"), 0.8, 0, 0.05, 0.1); D.link = 4;
  sld[1].setDsk(1, 4);
}

/////////////////////////////////// SLIDE 02 / продукты серии СТАНДАРТ: Econo - Largo - Особенности
function slide02_init()
{ setD(5); D.place(0, 1, 0.08, 1, -0.06, color(0, 110, 185)); D.setLabel(ISG("icon_return.png"), 0.15, 0, 0.01, 0); D.link = 1;
  setD(6); D.place(0, 0, 0.5, 0, 0.47, color(96, 94, 104)); D.setLabel(ISG("s02_d01_systema_Econo.png"), 0.7, 0, 0.04, 0.04);
  setD(7); D.place(0, 0.47, 0, 0.94, 0.5, color(89, 87, 97)); D.setLabel(ISG("s02_d02_systema_Largo.png"), 0.7, 0, 0.04, 0.04);
  setD(8); D.place(1, 0, 1, 0.94, -0.5, color(0, 110, 185)); D.setLabel(ISG("s02_d04_osobennosti_serii_STANDART.png"), 0.7, 0, 0.04, 0.15); 
  sld[2].setDsk(5, 8);
}

/////////////////////////////////// SLIDE 03 / продукты серии КОМФОРТ: Euro - Lumo - Bravo - Преимущества
function slide03_init()
{ setD(9);  D.place(0, 1, 0.08, 1, -0.06, color(195, 50, 115)); D.setLabel(ISG("icon_return.png"), 0, 0.6, 0.01, 0);  D.link = 1;
  setD(10); D.place(0, 0, 0.5, 0, 0.47, color(96, 94, 104)); D.setLabel(ISG("s03_d01_systema_Euro.png"), 0.7, 0, 0.04, 0.04);
  setD(11); D.place(0, 0.47, 0, 0.94, 0.5, color(89, 87, 97)); D.setLabel(ISG("s03_d02_systema_Lumo.png"), 0.7, 0, 0.04, 0.04); D.link = 5;
  setD(12); D.place(0.5, 0.94, 1, 0.94, -0.47, color(82, 80, 90)); D.setLabel(ISG("s03_d03_systema_Bravo.png"), 0.7, 0, 0.04, 0.04); 
  setD(13); D.place(1, 0, 1, 0.47, -0.5, color(195, 50, 115)); D.setLabel(ISG("s03_d04_preimushestva_serii_COMFORT.png"), 0.7, 0, 0.04, 0.04);
  sld[3].setDsk(9, 13);  
}

/////////////////////////////////// SLIDE 04 / продукты серии ПРЕМИУМ: Primo - Преимущества
function slide04_init()
{ setD(14); D.place(0, 1, 0.08, 1, -0.06, color(101, 82, 153)); D.setLabel(ISG("icon_return.png"), 0, 0.6, 0.01, 0); D.link = 1;
  setD(15); D.place(0, 0, 0, 0.94, 0.5, color(82, 80, 90)); D.setLabel(ISG("s04_d01_systema_Primo.png"), 0.7, 0, 0.04, 0.15);
  setD(16); D.place(0.5, 0, 1, 0, 0.94, color(101, 82, 153)); D.setLabel(ISG("s04_d02_preimushestva_serii_PREMIUM.png"), 0.7, 0, 0.04, 0.15);
  sld[4].setDsk(14, 16);  
}

/////////////////////////////////// SLIDE 05 / Продукт Lumo
function slide05_init()
{ setD(17); D.place(0, 0, 0, 1, 0.08, color(195, 50, 115)); D.setLabel(ISG("icon_return.png"), 0.15, 0, 0.01, dsk[5].getLabelPlaceY(-1)); D.loan = 0.05; D.link = 3;
  setD(18); D.place(0.08, 0, 1, 0, 0.94, color(89, 87, 97)); D.setLabel(ISG("s03_d02_systema_Lumo.png"), 0.4, 0, 0.04, 0.04); D.active = false; 
  sld[5].setDsk(17, 18);  
  setE(1); E.placeWithMask(18, 0, 0.9, -0.04, 0, ISG("s05_e01_Lumo.jpg"), ISG("s05_e01_Lumo_mask.png"));
  setE(2); E.place(18, 0, 0.9, -0.04, 0, ISG("s05_e03_Lumo_description_02.png")); //E.zoom = 0;
  setE(3); E.place(18, 0, 0.4, 0.04, -0.04, ISG("s05_e02_Lumo_description.png")); //E.setSwitch(1,2,3);
  sld[5].setElm(1, 3);
}

/////////////////////////////////// SLIDES MANAGMENT
function slide_switch()
{ if (sldNext >= 0) { return; } 
  let dmi = dskMouseIn(); if (dmi < 0) { return; }
  sld[sldCurrent].stopFrom(dmi);       
}

function slide_draw()
{ if ((dskWait >= 0) && (!dsk[dskWait].expanded)) { sld[sldCurrent].active = false; sldCurrent = sldNext; dskWait = sldNext = -1; }
  if (!sld[sldCurrent].active) { sld[sldCurrent].start(); sld[sldCurrent].active = true; } else { sld[sldCurrent].draw(); }
}

function mousePressed() { slide_switch(); }

let all_inited = false;
/////////////////////////////////// SETUP & DRAW
function setup()
{ cBack = color(255, 255, 255);
  createCanvas(windowWidth, windowHeight); smooth(); frameRate(30);
  smooth(8); strokeJoin(ROUND); strokeCap(ROUND); //frameRate(30);
  background(cBack);

  images_init();
}

///////////////////////////////////
function draw()
{ if (imageStoreProgressDraw()) { return; }
  
  if (!all_inited)
  { initDesks(); initElements(); initSlides();
    logo_init(); logo_start();
    slide01_init();
    slide02_init();
    slide03_init();
    slide04_init();  
    slide05_init();
    all_inited = true;
  }

  logo_draw(); if (!dsk[0].expanded) { return; }
  slide_draw();
}
