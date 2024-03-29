import { useSession, signIn } from 'next-auth/client'
import styles from './styles.module.scss'

import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js';
import { useRouter } from 'next/dist/client/router';

interface SubscribeButtonProps {
    priceId: string;
}

//getServerSideProps
//getStaticProps
//API routes

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
    const [session] = useSession();
    const router = useRouter();

    async function handleSubscribe() {
        if (!session) {
            signIn('github')
            return;
        }
        //Validar Inscrição para Evitar Duplicatas
        if (session.activeSubscription) {
            router.push('/posts')
            return;
        }

        //Criação da Checkout Session
        try {
            const response = await api.post('/subscribe')

            const { sessionId } = response.data;

            const stripe = await getStripeJs()

            await stripe.redirectToCheckout({ sessionId })
        } catch (err) {
            alert(err.message)
        }
    }
    return (
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    )
}