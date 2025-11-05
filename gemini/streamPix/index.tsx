/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from '@google/genai';
import { marked } from 'marked';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const POINT_NEMO_PROMPT = `| in the dead middle of the pacific ocean sits point nemo, we've been blasting boulders off mountains and dragging them there and we have an island of them .. thats the anchor from which our station will be built .. in the ocean below will be one cruise ship, whose purpose is to give perspective to how huge the elevator is  .. `;
const ORBITHELION_PROMPT = `| orbithelion - space elevator - hundreds  of platforms -- each in equilibrium - each weighs 1,000,000 pounds of material, == positive 1.0 MillionPoundsWeight(1MPW) -- their balloons collectively displace 1,200,000 pounds lift == negative 0.2, -0.2MPW = they float, w a vengeance -- they carry 0,050,000 pounds water ballast == sum neg 0.15 mpw -- they have N fans in an array, able to move air up/down through nozzles not reversing polarity , default of blowing UP (to offset the float) of whatever is needed per that moment's hardware == perfect equilibrium  .. they'll appear to be donut shaped collections of blimps, with a ring of fans around the outside, and elevator shafts / connecting pipes running between each stage `;
const CAMERA_POV = '| draw a picture that encapsulates point nemo, from a place a few miles away, with island-chain of boulders visible, in a sunrise. the station sections will be a sidelong relief view. .. 2 or 3 stages at the bottom will have details - '

async function debug(...args: Array<string | Error>) {
  const turn = document.createElement('div');
  const promises = args.map(
    async (arg) => await marked.parse(arg.toString() ?? ''),
  );
  const strings = await Promise.all(promises);
  turn.innerHTML = strings.join('');
  document.body.append(turn);
}

async function generateContentFrom() {
  const ai = new GoogleGenAI({ vertexai: false, apiKey: GEMINI_API_KEY });

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash-image',
    contents: POINT_NEMO_PROMPT + ORBITHELION_PROMPT + CAMERA_POV,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  let partialText = '';
  for await (const chunk of response) {
    const text = chunk.text;
    if (text) {
      partialText += text;
    } else if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      if (partialText) {
        await debug(partialText);
        partialText = '';
      }
      const src = `data:image/png;base64,${chunk.candidates[0].content.parts[0].inlineData.data}`;
      const img = new Image();
      img.src = src;
      document.body.append(img);
    }
  }
  if (partialText) {
    await debug(partialText);
    partialText = '';
  }
}

async function main() {
  await generateContentFrom().catch((e) => debug('got error', e));
}

main();
