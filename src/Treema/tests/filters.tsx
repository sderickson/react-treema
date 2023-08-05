import { onEvent } from './context';
import { getNoopLib } from '../utils';
import { TreemaRoot } from '../TreemaRoot';
import { GenericTest } from './types';
import React, { useCallback, useState } from 'react';
import { TreemaRootProps } from '../types';

/**
 * A parent component that has the data stored in its useState hook. It includes buttons for
 * changing the data, a display for the data, and a Treema instance.
 */
export const ParentComponent: React.FC<TreemaRootProps> = (props) => {
  const [filter, setFilter] = useState<string>('');
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }, [setFilter]);

  return (
    <div data-testid="integration-test">
      <span>Filter: </span>
      <input onChange={onChange} value={filter} data-testid="test-filter-input" />
      <TreemaRoot {...props} onEvent={onEvent} filter={filter} />
    </div>
  );
};

export const stringFilterTest: GenericTest = {
  name: 'setting a string filter should work',
  test: async (ctx) => {
    // todo
  },
};

const commonEnglishWords = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"];
const commonSpanishWords = ["gracias", "ser", "a", "ir", "estar", "bueno", "de", "su", "hacer", "amigo", "por", "no", "en", "haber", "tener", "un", "ahora", "y", "que", "por", "amar", "quién", "para", "venir", "porque", "el", "antes", "más", "bien", "aquí", "querer", "hola", "tú", "poder", "gustar", "poner", "casi", "saber", "como", "donde", "dar", "pero", "se", "mucho", "nuevo", "cuando", "chico", "entender", "si", "o", "feliz", "todo (all, every)", "mismo", "muy", "nunca", "yo", "sí", "grande", "deber", "usted", "bajo", "otro", "salir", "hora", "desde", "ver", "malo", "pensar", "hasta", "tanto", "entre", "durante", "llevar", "siempre", "empezar", "él", "leer", "cosa", "sacar", "conocer", "primero", "andar", "sobre", "echar", "sin", "decir", "trabajar", "nosotros", "también", "adiós", "comer", "triste", "país", "escuchar", "hombre", "mujer", "le", "creer", "encontrar", "beber"];

export const stringFilterProps: TreemaRootProps = {
  schemaLib: getNoopLib(),
  onEvent,
  data: {
    'English': commonEnglishWords,
    'Spanish': commonSpanishWords,
  },
  schema: {
    title: 'Common Words By Language',
    type: 'object',
    additionalProperties: {
      name: 'Common Words',
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};


