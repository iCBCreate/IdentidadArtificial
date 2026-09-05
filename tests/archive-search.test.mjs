import test from 'node:test'
import assert from 'node:assert/strict'
import { searchArticles, selectRelated } from '../source/lib/archive-search.mjs'
const corpus = [{title:'Ética de IA',description:'Una guía',tags:['agentes'],pubDate:'2026-05-01'}, {title:'Contexto',description:'Memoria de agentes',tags:[],pubDate:'2026-06-01'}]
test('search ignores accents and case, requires every term across fields', () => { assert.equal(searchArticles(corpus,'ETICA agentes').length,1); assert.equal(searchArticles(corpus,'ética contexto').length,0) })
test('empty search returns chronological corpus; unmatched query returns empty', () => { assert.equal(searchArticles(corpus,' ')[0].title,'Contexto'); assert.deepEqual(searchArticles(corpus,'inexistente'),[]) })
test('search finds a post beyond first static page', () => { const posts=Array.from({length:20},(_,i)=>({title:`Artículo ${i}`,description:'',pubDate:'2026-01-01'})); assert.equal(searchArticles(posts,'articulo 19')[0].title,'Artículo 19') })
test('related reading only uses existing posts, excludes current and duplicates, caps three', () => { const posts=['a','b','c','d','e'].map(id=>({id,data:{category:'Modelos',pubDate:new Date('2026-01-01')}})); assert.deepEqual(selectRelated('a','Modelos',posts,[{slug:'missing'},{slug:'a'},{slug:'b'},{slug:'b'}]).map(p=>p.id),['b','c','d']) })
