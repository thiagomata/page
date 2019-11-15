import { NextPage } from 'next'
import Layout from '../../components/MyLayout';
import fetch from 'isomorphic-unfetch';
import {Show} from "../../model/interfaces/Show";

interface Props {
    show: Show;
}

const Post: NextPage<Props> = ({show}) => (
  <Layout>
    <h1>{show.name}</h1>
    <p>{show.summary.replace(/<[/]?[pb]>/g, '')}</p>
    <img src={show.image.medium}  alt={"Image of the Page"}/>
  </Layout>
);

Post.getInitialProps = async function(context) {
  const { id } = context.query;
  console.log(`Fetching show: ${id}`);
  const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
  const show = await res.json();

  console.log(`Fetched show: ${show.name}`);

  return { show };
};

export default Post;