import React from 'react';
import { Metadata } from 'next';
import WidgetsComponent from '@/components/widgets/components-widgets';


export const metadata: Metadata = {
    title: 'Widgets',
};

const Widgets = () => {
    return (
      <div>
        <h1><WidgetsComponent/></h1>
      </div>
    );
  }
  
  export default Widgets;