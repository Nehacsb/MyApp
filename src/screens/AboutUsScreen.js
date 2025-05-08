import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


const EmailLink = ({ email }) => (
    <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)}>
        <Text style={styles.email}>{email}</Text>
    </TouchableOpacity>
);

const AboutUsScreen = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.mainContainer}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.container}>
                    <View style={styles.bannerContainer}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Icon name="information-circle-outline" size={24} color="#fff" style={styles.bannerIcon} />
                        <Text style={styles.bannerText}>About Us</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Current Contributors</Text>

                    <View style={styles.card}>
                        <View style={styles.entryRow}>
                            <Icon name="person" size={18} color="#50ABE7" />
                            <Text style={styles.name}>Jyoti</Text>
                        </View>
                        <View style={styles.entryRow}>
                            <Icon name="mail" size={18} color="#50ABE7" />
                            <EmailLink email="2022csb1319@iitrpr.ac.in" />
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.entryRow}>
                            <Icon name="person" size={18} color="#50ABE7" />
                            <Text style={styles.name}>Neha Dahire</Text>
                        </View>
                        <View style={styles.entryRow}>
                            <Icon name="mail" size={18} color="#50ABE7" />
                            <EmailLink email="2022csb1096iitrpr.ac.in" />
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.entryRow}>
                            <Icon name="person" size={18} color="#50ABE7" />
                            <Text style={styles.name}>Sanat Gupta</Text>
                        </View>
                        <View style={styles.entryRow}>
                            <Icon name="mail" size={18} color="#50ABE7" />
                            <EmailLink email="2022csb1119@iitrpr.ac.in" />
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.entryRow}>
                            <Icon name="person" size={18} color="#50ABE7" />
                            <Text style={styles.name}>Sai Pranav Nuti</Text>
                        </View>
                        <View style={styles.entryRow}>
                            <Icon name="mail" size={18} color="#50ABE7" />
                            <EmailLink email="2022csb1117@iitrpr.ac.in" />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Previous Contributors</Text>

                    <View style={styles.card}>
                        <View style={styles.entryRow}>
                            <Icon name="person" size={18} color="#50ABE7" />
                            <Text style={styles.name}>2021 Batch RideMate_Carpooling_P18</Text>
                        </View>
                        
                    </View>
                    <Text style={styles.sectionTitle}>Mentor</Text>

                    <View style={styles.card}>
                        <View style={styles.entryRow}>
                            <Icon name="school" size={18} color="#50ABE7" />
                            <Text style={styles.name}>Prof. Puneet Goyal</Text>
                        </View>
                        <View style={styles.entryRow}>
                            <Icon name="business" size={18} color="#50ABE7" />
                            <Text style={styles.subText}>Department of Computer Science, IIT Ropar</Text>
                        </View>
                        <View style={styles.entryRow}>
                            <Icon name="mail" size={18} color="#50ABE7" />
                            <EmailLink email="puneet@iitrpr.ac.in" />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>App Description</Text>

                    <View style={styles.card}>
                        <Text style={styles.text}>
                            This app was developed under the Developmental Engineering Project (DEP) at IIT Ropar to facilitate secure and efficient ride sharing among the campus community. It has evolved through contributions across multiple batches under expert mentorship.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    container: {
        padding: 16,
    },
    bannerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#50ABE7',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    bannerIcon: {
        marginRight: 10,
    },
    backButton: {
        marginRight: 10,
    },

    bannerText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 12,
        color: '#444',
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    entryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginLeft: 8,
    },
    email: {
        fontSize: 15,
        color: '#50ABE7',
        textDecorationLine: 'underline',
        marginLeft: 8,
    },
    subText: {
        fontSize: 15,
        color: '#555',
        marginLeft: 8,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        color: '#333',
    },
});

export default AboutUsScreen;