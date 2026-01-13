import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    signUp(@Body() signUpDto: any) {
        return this.authService.signUp(signUpDto.email, signUpDto.password, signUpDto.name);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() signInDto: any) {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }
}
