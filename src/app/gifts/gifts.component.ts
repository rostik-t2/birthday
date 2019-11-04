import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {animate, keyframes, query, stagger, state, style, transition, trigger} from "@angular/animations";
import {AngularFireAuth} from "angularfire2/auth";
import {User} from "firebase";
import {Router} from "@angular/router";
import {AngularFirestore, AngularFirestoreCollection} from "angularfire2/firestore";
import {Observable, Subject} from "rxjs/index";
import { map, debounceTime } from 'rxjs/operators';
import {AuthService, IAuthInfo} from "../auth.service";

@Component({
  selector: 'app-gifts',
  templateUrl: './gifts.component.html',
  styleUrls: ['./gifts.component.scss'],
  animations: [
    trigger('ngIfAnimation', [
      state('void', style({
        opacity: 0
      })),
      state('*',   style({
        opacity: 1
      })),
      transition('void => *', animate('0.5s ease-in')),
    ])
  ]
})
export class GiftsComponent implements OnInit {

  @ViewChild('basicModal', { static: false }) private basicModal;
  // @ViewChild('cardNumberModal', { static: false }) private cardNumberModal;
  public gifts: IGift[] = [
    {
      id: 1,
      title: 'Велосипед',
      image: '/assets/bicycle.png',
      price: 11500,
      amount: 0,
      description: '',
      gif:  '/assets/happy.gif',
      hovered: false,
      acceptedText: 'Ух ты! Я как раз мечтала о таком! Теперь буду самой быстрой в парке!!!'
    }
    , {
      id: 2,
      title: 'Автокресло',
      image: '/assets/autokreslo2.png',
      price: 16000,
      amount: 0,
      description: '',
      gif:  '/assets/please6.gif',
      hovered: false,
      acceptedText: 'Вот здорово! Новое удобное кресло! Теперь я готова с мамой и папой хоть в Африку на машине!'
    }    , {
      id: 3,
      title: 'Мед. страховка',
      image: '/assets/strahovka.jpg',
      price: 147000,
      amount: 0,
      description: '',
      gif:  '/assets/please6.gif',
      hovered: false,
      acceptedText: 'Ой, вы знаете, я вообще не очень люблю ходить в поликлинику, но родители говорят, что это очень важно и так я всегда буду здоровой! А я хочу быть здоровой, правда-правда :)'
    }    , {
      id: 4,
      title: 'Коляска',
      image: '/assets/kolyaska.png',
      price: 8300,
      amount: 0,
      description: '',
      gif:  '/assets/please6.gif',
      hovered: false,
      acceptedText: 'Ура! Новая коляска для прогулок! Мне уже нравится :)'
    }
  ];
  public myDonation: number = 0;

  public amount: FormControl = new FormControl('', Validators.min(100));

  public paymentChosen: PaymentType = null;
  public readonly PaymentType: typeof PaymentType = PaymentType;
  public giftChosen: IGift = null;
  public showAlert: boolean = false;
  private itemsCollection: AngularFirestoreCollection<IDonation>;
  public items: Observable<IDonation[]>;
  public authorName: string = '';
  public authorSurname: string = '';
  public choiceConfirmed: any = null;

  constructor(private angularFireAuth: AngularFireAuth, private dbStore: AngularFirestore, private router: Router) {
    if (AuthService.getAuthInfo()) {
      const authInfo: IAuthInfo = AuthService.getAuthInfo();
      this.authorName = authInfo.name;
      this.authorSurname = authInfo.surname;
    } else {
      this.router.navigate(['/auth']);
    }
    // this.angularFireAuth.user.subscribe((user: User) => {
    //   if (user && user.displayName) {
    //     this.user = user;
    //   } else {
    //     this.router.navigate(['/auth']);
    //   }
    // });
    this.itemsCollection = this.dbStore.collection<IDonation>('donations');
    this.itemsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => a.payload.doc.data() as IDonation)),
    ).subscribe((items: IDonation[]) => {
      this.gifts.forEach(el => el.amount = 0);
      this.myDonation = 0;
      items.forEach((donation: IDonation) => {
        const currentGift = this.gifts.find(el => el.id === donation.giftId);
        if (currentGift) {
          currentGift.amount += donation.amount;
        }
        if (donation.authorSurname === this.authorSurname && donation.authorName === this.authorName) {
          this.myDonation += donation.amount;
        }
      })
    })
  }

  /**
   * При клике открывается модалка с текстом "Спасибо за выбор! Какую сумму вы готовы внести?" И инпут с суммой.
   * После ввода суммы появляется вопрос: "хотите сделать перевод прямо сейчас?"
   * Да: "Скопируйте номер моей кары и введите его на форме по ссылке"
   * Нет: "Спасибо, буду ждать от вас конвертик :)"
   */

  ngOnInit() {
  }

  onHover(gift: IGift) {
    gift.hovered = true;

  }
  onUnhover(gift: IGift) {
    gift.hovered = false;
  }

  public confirmChoice(amount: number) {
    this.registerPayment(amount);
  }

  public removeChoice() {
    if (this.choiceConfirmed) {
      this.choiceConfirmed.delete().then(() => {
        this.choiceConfirmed = null;
      });
    }
  }

  public registerPayment(amount: number): void {
    const donation: IDonation = {
      amount: amount,
      paymentType: this.paymentChosen,
      authorName: this.authorName,
      authorSurname: this.authorSurname,
      dateTime: new Date(),
      giftId: this.giftChosen.id
    };

    this.itemsCollection.add(donation).then((doc) => {
      this.choiceConfirmed = doc;
    });
  }

  public closeModal() {
    this.basicModal.hide();
    this.paymentChosen = null;
    this.giftChosen = null;
    this.choiceConfirmed = null;
    this.amount.reset();
  }
  public openAlfaportal(amount: number) {
    // this.copyToClipboard();
    window.open('https://money.alfabank.ru/p2p/web/transfer/rterekhov5727', '_blank').focus();
    // this.cardNumberModal.show();
  }

  public copyToClipboard() {
    try {
      const cardNumber: HTMLElement = document.querySelector('#cardNumber');
      cardNumber.focus();
      const range = document.getSelection().getRangeAt(0);
      range.selectNode(cardNumber);
      window.getSelection().addRange(range);
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
    } catch {}

    this.showAlert = true;
    const success = new Subject<string>();
    success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.showAlert = false );
    success.next();
  }

  public logout() {
    AuthService.clearAuthInfo();
    this.router.navigate(['/auth']);
  }

}

interface IGift {
  id: number;
  title: string;
  image: string;
  price: number;
  amount: number;
  description: string;
  gif?: string;
  hovered: boolean;
  acceptedText: string;
}

interface IDonation {
  amount: number;
  paymentType: PaymentType;
  authorName: string;
  authorSurname: string;
  dateTime: Date;
  giftId: number;
}

enum PaymentType {
  CASH = 'cash',
  CARD = 'card'
}
