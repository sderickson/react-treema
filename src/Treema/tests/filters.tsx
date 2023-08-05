import { onEvent } from './context';
import { getNoopLib } from '../utils';
import { TreemaRoot } from '../TreemaRoot';
import { GenericTest } from './types';
import React, { useCallback, useState } from 'react';
import { TreemaRootProps, TreemaFilter, TreemaNodeWalkContext } from '../types';

export const ParentComponent: React.FC<TreemaRootProps> = (props) => {
  const [filter, setFilter] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('string');
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }, [setFilter]);

  let filterProp: TreemaFilter;
  if (filterType === 'string') {
    filterProp = filter;
  } else if (filterType === 'regex') {
    filterProp = new RegExp(filter, 'i');
  } else {
    filterProp = (ctx: TreemaNodeWalkContext) => {
      if (ctx.schema.type === 'string' && typeof ctx.data === 'string') {
        return ctx.data.includes(filter);
      }
      return false;
    };
  }

  return (
    <div data-testid="integration-test">
      <span>Filter: </span>
      <input onChange={onChange} value={filter} data-testid="test-filter-input" />
      <div>
        <label htmlFor="filter-type">Filter Type: </label>
        <select id="filter-type" data-testid="test-filter-type" onChange={(val) => {setFilterType(val.target.value)}}>
          <option value="string">String (exact match)</option>
          <option value="regex">Regex (case-insensitive)</option>
          <option value="function">Function (matches only words, not language)</option>
        </select>
      </div>
      <TreemaRoot {...props} onEvent={onEvent} filter={filterProp} />
    </div>
  );
};

export const stringFilterTest: GenericTest = {
  name: 'setting a string filter should work',
  test: async (ctx) => {
    await ctx.type(ctx.query().getByTestId('test-filter-input'), 'te');
    ctx.expect(ctx.query().queryByText('English:')).toBeTruthy();
    ctx.expect(ctx.query().queryByText('after')).toBeTruthy();
    ctx.expect(ctx.query().queryByText('hacer')).toBe(null);
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


