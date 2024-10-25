import React from "react";
import { useNavigate } from "react-router";
import { useBeforeUnload } from "react-router-dom";

export const shouldValidate = false;

Component.displayName = 'index';

export default function Component() {
  const nav = useNavigate();
  return <div>
    <span role="heading">index.tsx</span><br />
    <button onClick={
      () => nav('page1')
    }>page1</button>
    <button onClick={
      () => nav('page2')
    }>page2</button>
    <button onClick={
      () => nav('page3/page3-1/page3-1-1')
    }>page3</button>
    <button onClick={
      () => nav('page4')
    }>page4</button>
  </div>
}
