import Layout from '../../../../../../components/Layout'
import { Headline, UpdateNFTDID } from '../../../../../../components'
import stylesDark from '../../../../../styles.module.scss'
import stylesLight from '../../../../../styleslight.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'

function Header() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const data = [
        {
            name: t('WALLET'),
            route: '/didx/wallet',
        },
        {
            name: t('NFT OPERATIONS'),
            route: '/didx/wallet/dns',
        },
        {
            name: t('MANAGE NFT'),
            route: '/didx/wallet/dns/manage',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>{t('UPDATE NFT DID')}</h2>
                </div>
                <h4>{t('COMING SOON')}</h4>
            </Layout>
        </>
    )
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
    return {
        paths: [],
        fallback: 'blocking',
    }
}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
})

export default Header
