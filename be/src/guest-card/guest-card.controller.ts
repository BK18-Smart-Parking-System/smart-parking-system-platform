import { Body, Controller, Get, Param, Post, HttpCode } from '@nestjs/common';
import { GuestCardService } from './guest-card.service';
import { CreateGuestCardDto } from './dto/guest-card.dto';

@Controller('guest-cards')
export class GuestCardController {
  constructor(private readonly guestCardService: GuestCardService) {}

  /**
   * GET /api/guest-cards — Lấy danh sách tất cả guest cards
   */
  @Get()
  async getAllGuestCards() {
    return this.guestCardService.getAllGuestCards();
  }

  /**
   * POST /api/guest-cards — Tạo thẻ RFID mới cho khách vãng lai
   */
  @Post()
  async createGuestCard(@Body() body: CreateGuestCardDto) {
    return this.guestCardService.createGuestCard(body.uid);
  }

  /**
   * POST /api/guest-cards/:uid/check-in — Guest check-in
   */
  @Post(':uid/check-in')
  async checkIn(@Param('uid') uid: string) {
    return this.guestCardService.checkIn(uid);
  }

  /**
   * POST /api/guest-cards/:uid/check-out — Guest check-out
   */
  @Post(':uid/check-out')
  async checkOut(@Param('uid') uid: string) {
    return this.guestCardService.checkOut(uid);
  }

  /**
   * POST /api/guest-cards/checkout-all/guests — Check-out tất cả xe Guest (CASH)
   */
  @Post('checkout-all/guests')
  @HttpCode(200)
  async checkoutAllGuests() {
    return this.guestCardService.checkoutAllGuests();
  }

  /**
   * POST /api/guest-cards/checkout-all/users — Check-out tất cả xe User (BKPAY_QR)
   */
  @Post('checkout-all/users')
  @HttpCode(200)
  async checkoutAllUsers() {
    return this.guestCardService.checkoutAllUsers();
  }
}
