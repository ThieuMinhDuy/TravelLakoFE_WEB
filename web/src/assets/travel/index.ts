import haLong from './ha-long.jpg';
import hoiAn from './hoi-an.jpg';
import daNang from './da-nang.jpg';
import haNoi from './ha-noi.jpg';

/** Editorial photos for the interface; these are not place records from the API. */
export const travelImages = {
  haLong: {
    src: haLong,
    alt: 'Các đảo đá vôi trên mặt nước xanh của vịnh Hạ Long',
    author: 'Mustang Joe',
    source:
      'https://commons.wikimedia.org/wiki/File:H%E1%BA%A1_Long_Bay_Panorama,_Vietnam.jpg',
    license: 'CC0-1.0',
  },
  hoiAn: {
    src: hoiAn,
    alt: 'Phố cổ Hội An với nhà vàng và đèn lồng trong một chiều mưa',
    author: 'lumoplank',
    source: 'https://commons.wikimedia.org/wiki/File:Hoi_An_-_HoiAn1435.jpg',
    license: 'CC0-1.0',
  },
  daNang: {
    src: daNang,
    alt: 'Cầu Rồng và thành phố Đà Nẵng dưới bầu trời hoàng hôn',
    author: 'Quangpraha',
    source: 'https://commons.wikimedia.org/wiki/File:Da_Nang,_Vietnam.jpg',
    license: 'CC0-1.0',
  },
  haNoi: {
    src: haNoi,
    alt: 'Không gian xanh và đường đi bộ bên hồ Hoàn Kiếm, Hà Nội',
    author: 'Daderot',
    source:
      'https://commons.wikimedia.org/wiki/File:Hoan_Kiem_Lake_-_Hanoi,_Vietnam_-_DSC03693.JPG',
    license: 'CC0-1.0',
  },
} as const;
