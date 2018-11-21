import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {animate, keyframes, query, stagger, state, style, transition, trigger} from "@angular/animations";
import {AngularFireAuth} from "angularfire2/auth";
import {User} from "firebase";
import {Router} from "@angular/router";
import {AngularFirestore, AngularFirestoreCollection} from "angularfire2/firestore";
import {Observable, Subject} from "rxjs/index";
import { map, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-gifts',
  templateUrl: './gifts.component.html',
  styleUrls: ['./gifts.component.scss'],
  animations: [
    // trigger('ngIfAnimation', [
    //   transition('void => *', [
    //     //query('*', style({ opacity: 0, background: 'blue' }), {optional: true}),
    //     query('*', stagger('300ms', [
    //       animate('0.8s ease-in', keyframes([
    //         style({opacity: 0}),
    //         style({opacity: 1}),
    //       ]))]), {optional: true}),
    //   ]),
    //   // transition('* => void', [
    //   //   //query('*', style({ opacity: 1, background: 'red' }), {optional: true}),
    //   //   query('*', stagger('300ms', [
    //   //     animate('0.8s ease-in', keyframes([
    //   //       style({opacity: 1}),
    //   //       style({opacity: 0}),
    //   //     ]))]), {optional: true}),
    //   // ])
    // ])
    trigger('ngIfAnimation', [
      state('void', style({
        opacity: 0
      })),
      state('*',   style({
        opacity: 1
      })),
      transition('void => *', animate('0.5s ease-in')),
      //transition('active => inactive', animate('100ms ease-out'))
    ])
  ]
})
export class GiftsComponent implements OnInit {

  @ViewChild('basicModal') private basicModal;
  @ViewChild('cardNumberModal') private cardNumberModal;
  private user: User = null;
  public gifts: IGift[] = [
    {
      id: 1,
      title: 'Компьютер',
      image: '/assets/comp-t.gif',
      price: 70000,
      amount: 0,
      description: '',
      gif:  '/assets/please2.gif',
      hovered: false
    }, {
      id: 2,
      title: 'Телефон',
      image: '/assets/s9t.gif',
      price: 45000,
      amount: 0,
      description: '',
      gif:  '/assets/please6.gif',
      hovered: false
    }
  ];
  public myDonation: number = 0;

  public amount: FormControl = new FormControl('', Validators.min(100));

  public paymentChosen: PaymentType = null;
  public readonly PaymentType: typeof PaymentType = PaymentType;
  public giftChosen: number = null;
  public showAlert: boolean = false;
  private itemsCollection: AngularFirestoreCollection<IDonation>;
  public items: Observable<IDonation[]>;

  constructor(private angularFireAuth: AngularFireAuth, private dbStore: AngularFirestore, private router: Router) {
    this.angularFireAuth.user.subscribe((user: User) => {
      if (user && user.displayName) {
        this.user = user;
      } else {
        this.router.navigate(['/auth']);
      }
    });
    this.itemsCollection = this.dbStore.collection<IDonation>('donations');
    this.itemsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => a.payload.doc.data() as IDonation)),
    ).subscribe((items: IDonation[]) => {
      this.gifts.forEach(el => el.amount = 0);
      this.myDonation = 0;
      items.forEach((donation: IDonation) => {
        this.gifts.find(el => el.id === donation.giftId).amount += donation.amount;
        if (donation.authorEmail === this.user.email) {
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

  public registerPayment(amount: number): void {
    const donation: IDonation = {
      amount: amount,
      paymentType: this.paymentChosen,
      authorName: this.user.displayName,
      authorEmail: this.user.email,
      dateTime: new Date(),
      giftId: this.giftChosen
    };

    this.itemsCollection.add(donation);
    this.closeModal();
  }

  public closeModal() {
    this.basicModal.hide();
    this.paymentChosen = null;
    this.giftChosen = null;
  }
  public openAlfaportal(amount: number) {
    this.copyToClipboard();
    window.open('https://www.alfaportal.ru/card2card/ptpl/alfaportal/initial.html', '_blank').focus();
    this.registerPayment(amount);
    this.cardNumberModal.show();
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
    this.angularFireAuth.auth.signOut();
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
}

interface IDonation {
  amount: number;
  paymentType: PaymentType;
  authorName: string;
  authorEmail: string;
  dateTime: Date;
  giftId: number;
}

enum PaymentType {
  CASH = 'cash',
  CARD = 'card'
}
