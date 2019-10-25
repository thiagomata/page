import { NextPage } from 'next'
import Layout from '../components/MyLayout';
import { Show } from '../data/Show'
import fetch from 'isomorphic-unfetch';
import Link from 'next/link';

interface Props {
    userAgent?: string,
    shows: Show[],
}

const Page: NextPage<Props> = ({ userAgent, shows }) => (
    <Layout>
        <main>Your user agent: {userAgent}</main>
        <ul>
            {shows.map(show => (
                <li key={show.id}>
                    <Link href="/p/[id]" as={`/p/${show.id}`}>
                        <a>{show.name}</a>
                    </Link>
                </li>
            ))}
        </ul>
    </Layout>
)

Page.getInitialProps = async ({ req }) => {
    const userAgent = req ? req.headers['user-agent'] : navigator.userAgent
    const res = await fetch('https://api.tvmaze.com/search/shows?q=batman');
    const data = await res.json();

    console.log(`Show data fetched. Count: ${data.length}`);

    let shows:Show[] = data.map(
        (element:any): Show => {
            return {
                name: "" + element.show.name,
                id: element.show.id,
                image: {
                    medium: element.show.image.medium,
                },
                summary: element.summary
            }
        }
    )

    return {
        userAgent: userAgent,
        shows: shows,
    };
}

export default Page