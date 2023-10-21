export default function Test(props: any) {
  console.log(props);
  return <h1>Welcome: {props.authSig}</h1>;
}
