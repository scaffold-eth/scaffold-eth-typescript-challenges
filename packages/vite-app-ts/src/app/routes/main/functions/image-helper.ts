import image_0 from '../../../../images/0.png'
import image_1 from '../../../../images/1.png'
import image_2 from '../../../../images/2.png'
import image_3 from '../../../../images/3.png'
import image_4 from '../../../../images/4.png'
import image_5 from '../../../../images/5.png'
import image_6 from '../../../../images/6.png'
import image_7 from '../../../../images/7.png'
import image_8 from '../../../../images/8.png'
import image_9 from '../../../../images/9.png'
import image_A from '../../../../images/A.png'
import image_B from '../../../../images/B.png'
import image_C from '../../../../images/C.png'
import image_D from '../../../../images/D.png'
import image_E from '../../../../images/E.png'
import image_F from '../../../../images/F.png'
import image_ROLL from '../../../../images/ROLL.png'

export const getImage = (name: string) => {
    switch (name) {
        case '0.png':
            return image_0;
        case '1.png':
            return image_1;
        case '2.png':
            return image_2;
        case '3.png':
            return image_3;
        case '4.png':
            return image_4;
        case '5.png':
            return image_5;
        case '6.png':
            return image_6;
        case '7.png':
            return image_7;
        case '8.png':
            return image_8;
        case '9.png':
            return image_9;
        case 'A.png':
            return image_A;
        case 'B.png':
            return image_B;
        case 'C.png':
            return image_C;
        case 'D.png':
            return image_D;
        case 'E.png':
            return image_E;
        case 'F.png':
            return image_F;
        default:
            return image_ROLL;
    }
};
