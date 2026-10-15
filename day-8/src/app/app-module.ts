import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { App } from './app';
import { Panel } from './components/panel/panel';
import { StarRating } from './components/star-rating/star-rating';
import { ReviewForm } from './components/review-form/review-form';
import { DynamicLoader } from './components/dynamic-loader/dynamic-loader';
import { CounterWidget } from './components/widgets/counter-widget/counter-widget';
import { ClockWidget } from './components/widgets/clock-widget/clock-widget';
import { QuoteWidget } from './components/widgets/quote-widget/quote-widget';

@NgModule({
  declarations: [
    App,
    Panel,
    StarRating,
    ReviewForm,
    DynamicLoader,
    CounterWidget,
    ClockWidget,
    QuoteWidget,
  ],
  imports: [BrowserModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
