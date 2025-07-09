export const PROVIDER_TOKEN = '';

export const ticketPrice = 2000; // рубли

export type PARTER = 0;
export type BALCONY = 1;
export type L_BALCONY = 2;
export type R_BALCONY = 3;

export const parter: PARTER = 0;
export const balcony: BALCONY = 1;
export const l_balcony: L_BALCONY = 2;
export const r_balcony: R_BALCONY = 3;

export const decimalPlaceNumber = 111;

export enum Statuses {
  'Reserved',
  'Purchased',
  'Reset',
}

export type Sectors = PARTER | BALCONY | L_BALCONY | R_BALCONY;

type CountRowsType = {
  [key in Sectors]: number;
};

export const CountRows: CountRowsType = {
  0: 25, // PARTER
  1: 8, // BALCONY
  2: 1, // L_BALCONY
  3: 1, // R_BALCONY
};

export function getSectorTitle(sector: Sectors): string {
  switch (sector) {
    case parter:
      return 'Партер';
    case balcony:
      return 'Балкон';
    case l_balcony:
      return 'Левый балкон';
    case r_balcony:
      return 'Правый балкон';
  }
}

export const ReservePeriodMs = 130000; // 100 для тестов, 30 * 60 * 1000 для прода

export function getFullListRows(sector: Sectors) {
  console.log('sector', sector);
  console.log('CountRows[sector]', CountRows[sector]);
  return [...Array(CountRows[sector]).keys()].map((i: number) => i + 1);
}

export const getLastSeat = (sector: Sectors, row: number | null) => {
  if (sector === parter) {
    if (row === null || row < 1 || row > 25) {
      throw new TypeError(`totalNumberOfTickets: wrong param row = ${row}`);
    } else {
      if (row <= 24 && row >= 9) return 42;
      switch (row) {
        case 25:
          return 36;
        case 8:
          return 40;
        case 7:
          return 39;
        case 6:
          return 39;
        case 5:
          return 38;
        case 4:
          return 38;
        case 3:
          return 36;
        case 2:
          return 36;
        case 1:
          return 34;
      }
    }
  } else if (sector == balcony) {
    if (row === null || row < 1 || row > 8) {
      throw new TypeError(`totalNumberOfTickets: wrong param row = ${row}`);
    } else {
      switch (row) {
        case 8:
          return 22;
        case 7:
          return 22;
        case 6:
          return 20;
        case 5:
          return 32;
        case 4:
          return 38;
        case 3:
          return 38;
        case 2:
          return 38;
        case 1:
          return 38;
      }
    }
  } else if (sector == l_balcony || sector == r_balcony) {
    return 33;
  }
};

export function getFullListSeats(sector: Sectors, row: number) {
  console.log('sector', sector);
  console.log('CountRows[sector]', CountRows[sector]);
  let arr: number[] = [...Array(getLastSeat(sector, row)).keys()].map(
    (i: number) => i + 1,
  );
  if (sector === parter) {
    if (row <= 5) {
      arr = [decimalPlaceNumber, ...arr];
    }
    if (row <= 7) {
      arr = [0, ...arr];
    }
  }
  return arr;
}

export const getCountSeat = (sector: Sectors, row: number) => {
  let lastSeat: number | undefined;
  try {
    lastSeat = getLastSeat(sector, row);
    if (lastSeat === undefined)
      throw new TypeError('getCountSeat: getLastSeat return undefined');
  } catch (e) {
    throw new TypeError(e?.message);
  }
  if (sector === parter) {
    if (row === null) {
      throw new TypeError(
        `getCountSeat: incorrect params: sector ${sector}, row: ${row}`,
      );
    }
    if (row <= 5) return lastSeat + 2;
    if (row <= 7) return lastSeat + 1;
  }
  return lastSeat;
};

export const texts = {
  hall: 'Схема зала',
  selectSector: 'Выберите сектор',
  selectRow: 'Выберите ряд',
  selectSeats: 'Выберите место',
  reservedTickets: 'Зарезервированные билеты',
  purchasedTickets: 'Купленные билеты',
  purchasedTicketsNotFound: 'не найдено',
  reservedTicketsNotFound: 'не найдено',
  nameForPayment: 'Билеты на отчетный концерт',
  descriptionForPayment: 'отчетный концерт в ДГТУ',
  reset: 'Выбор билетов отменен',
};
