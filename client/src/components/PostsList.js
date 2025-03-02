import React, { Component } from 'react';
import {
    Alert,
    Jumbotron,
    ListGroup,
    ListGroupItem,
    Spinner,
    Button,
	Row, Col, Card
} from 'reactstrap';
import { ProgressBar } from 'react-bootstrap';
import Chart from 'react-google-charts';

import { Link } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getPosts, addPost } from '../actions/postActions';
import MarkdownIt from 'markdown-it';
import DOMPurify from "dompurify";

const mdParser = new MarkdownIt();

class PostsList extends Component {
    state = {
        bandwidth: null,
		usageData: [
			['Country', 'Utilization'], // Correct column header
			['UG', 60],
			['EG', 40],
			['NG', 50],
			['CD', 30],
			['ZA', 45]
		]
    };

    componentDidMount() {
        this.props.getPosts();
        this.measureBandwidth();
    }

    measureBandwidth = () => {
        const imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
        const startTime = new Date().getTime();
        
        const img = new Image();
        img.src = imageUrl + "?t=" + startTime;
        img.onload = () => {
            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000;
            const fileSize = 14 * 1024;
            const speed = (fileSize / duration) / 1024;
            
            this.setState({ bandwidth: speed.toFixed(2) + " KBps" });
        };
    };
	

    render() {
        const { posts, loading } = this.props.post;
        const { bandwidth } = this.state;
		

        return (
            <div>
                <Jumbotron className="text-center">
                    <h1 className="display-4">Welcome to KONEKTA Forum!</h1>
                    <p className="lead">
                        KONEKTA – Connecting Africa Through Knowledge, Innovation, and Technology. 🚀
                    </p>
                    <hr className="my-2" />
                    <p>
                        If you haven't done yet, we recommend you to{' '}
                        <Link to="/register">register a new account here</Link>.
						<p>Join discussions across Africa! 🌍✨ {`🇺🇬 🇪🇬 🇳🇬 🇿🇦 🇰🇪 🇬🇭 🇪🇹 🇲🇦 🇨🇩 🇹🇳 🇿🇲 🇸🇩 🇸🇳 🇨🇲 🇿🇼 🇲🇿 🇲🇱 🇧🇫 🇲🇬 🇳🇪 🇲🇺 🇧🇼 🇪🇷 🇧🇮 🇱🇸 🇬🇲 🇱🇾 🇹🇬 🇸🇨 🇨🇫 🇹🇩 🇲🇼 🇩🇯`}</p>
                    </p>
                    {bandwidth && (
                        <p className="text-muted">Network Speed: {bandwidth}</p>
                    )}
                </Jumbotron>
				<Row className="mt-4">
                    <Col md={6}>
                        <Card className="p-3 h-100">
                            <h5>AI-Powered Network Resource Insights</h5>
                            <p>Analyzing digital infrastructure utilization across Africa.</p>
                            <ProgressBar now={60} label={`60% Utilized`} variant="success" className="mb-3" />
                            <ProgressBar now={40} label={`40% Available`} variant="warning" />
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="p-3 h-100">
                            <h5>Resource Utilization Heatmap</h5>
                            <Chart
                                chartType="GeoChart"
                                width="100%"
                                height="300px"
                                data={this.state.usageData}
                                options={{
                                    region: '002', // Africa region
                                    displayMode: 'regions',
                                    resolution: 'countries',
                                    colorAxis: { colors: ['#ffc107', '#28a745'] }
                                }}
                            />
                        </Card>
                    </Col>

                </Row>

                {loading ? (
                    <div className="w-100 d-flex justify-content-center">
                        <Spinner type="grow" color="primary" style={{ width: '3rem', height: '3rem' }} />
                    </div>
                ) : (
                    <ListGroup className="mt-4">
                        <TransitionGroup className="posts-list">
                            {posts.map(({ _id, title, content }) => (
                                <CSSTransition key={_id} timeout={500} classNames="fade" appear>
                                    <ListGroupItem className="py-4 shadow-sm border rounded bg-light mb-3">
                                        <h3 className="text-primary">{title}</h3>
                                        <div
                                            className="text-muted"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(mdParser.render(content)),
                                            }}
                                        />
                                        <div className="mt-3 d-flex justify-content-end">
                                            <Link to={`/post/${_id}`}>
                                                <Button color="primary">Read More</Button>
                                            </Link>
                                        </div>
                                    </ListGroupItem>
                                </CSSTransition>
                            ))}
                        </TransitionGroup>
                    </ListGroup>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({ post: state.post, isAuthenticated: state.auth.isAuthenticated });
export default connect(mapStateToProps, { getPosts, addPost })(PostsList);
