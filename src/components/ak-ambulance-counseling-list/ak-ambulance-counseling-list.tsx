import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ak-ambulance-counseling-list',
  styleUrl: 'ak-ambulance-counseling-list.css',
  shadow: true,
})
export class AkAmbulanceCounselingList {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
