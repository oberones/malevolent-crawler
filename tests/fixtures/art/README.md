# Independent art fixtures

PNG scanlines were constructed with Python standard-library zlib/struct, independently of Sharp and the packer under test. valid.png is 8 by 4 RGBA with a one-pixel transparent border; odd.png and valid.ico are 127 by 128. ICO headers were independently encoded with struct. Opaque, blank, RGB-only and truncated cases are intentional. None is runtime artwork.
